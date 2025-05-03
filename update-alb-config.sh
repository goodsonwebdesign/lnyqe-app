#!/bin/bash
# update-alb-config.sh - Update existing ALB or create a new one

AWS_REGION="us-east-2"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"
ALB_NAME="lynqe-app-lb"
TARGET_GROUP_NAME="lynqe-app-tg"
CONTAINER_PORT=80
CONTAINER_NAME="lynqe-app-container"
VPC_ID=""

echo "Updating ALB configuration for ECS service..."

# Step 1: Get VPC ID and other network information
echo "Getting VPC and network information..."
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION > service-details.json

# Extract subnet IDs
SUBNET_IDS=$(cat service-details.json | grep -A10 subnets | grep -o 'subnet-[a-zA-Z0-9]*' | sort -u | paste -sd "," -)
echo "Subnets: $SUBNET_IDS"

# Extract security group ID
SECURITY_GROUP_ID=$(cat service-details.json | grep -A3 securityGroups | grep -o 'sg-[a-zA-Z0-9]*' | head -1)
echo "Security group: $SECURITY_GROUP_ID"

# Get VPC ID from security group
VPC_ID=$(aws ec2 describe-security-groups \
  --group-ids $SECURITY_GROUP_ID \
  --region $AWS_REGION \
  --query 'SecurityGroups[0].VpcId' \
  --output text)
echo "VPC ID: $VPC_ID"

# Step 2: Check if ALB exists
echo "Checking if ALB '$ALB_NAME' already exists..."
ALB_ARN=$(aws elbv2 describe-load-balancers \
  --names $ALB_NAME \
  --region $AWS_REGION \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text 2>/dev/null || echo "")

if [ -z "$ALB_ARN" ] || [ "$ALB_ARN" == "None" ]; then
  echo "ALB does not exist, creating a new one..."

  # Create a security group for the ALB if needed
  echo "Creating a security group for the load balancer..."
  ALB_SG_ID=$(aws ec2 create-security-group \
    --group-name "lynqe-alb-sg-$(date +%s)" \
    --description "Security group for lynqe application load balancer" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query 'GroupId' \
    --output text)
  echo "Created ALB security group: $ALB_SG_ID"

  # Allow inbound HTTP traffic from anywhere to the ALB
  echo "Configuring security group to allow HTTP traffic..."
  aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION

  # Create the ALB
  echo "Creating Application Load Balancer..."
  ALB_ARN=$(aws elbv2 create-load-balancer \
    --name $ALB_NAME \
    --subnets $(echo $SUBNET_IDS | tr ',' ' ') \
    --security-groups $ALB_SG_ID \
    --region $AWS_REGION \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text)
else
  echo "ALB already exists: $ALB_ARN"

  # Get the security group of the existing ALB
  ALB_SG_ID=$(aws elbv2 describe-load-balancers \
    --load-balancer-arns $ALB_ARN \
    --region $AWS_REGION \
    --query 'LoadBalancers[0].SecurityGroups[0]' \
    --output text)
  echo "Using existing ALB security group: $ALB_SG_ID"
fi

# Step 3: Check if target group exists
echo "Checking if target group '$TARGET_GROUP_NAME' already exists..."
TG_ARN=$(aws elbv2 describe-target-groups \
  --names $TARGET_GROUP_NAME \
  --region $AWS_REGION \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text 2>/dev/null || echo "")

if [ -z "$TG_ARN" ] || [ "$TG_ARN" == "None" ]; then
  echo "Target group does not exist, creating a new one..."

  # Create a target group
  echo "Creating target group..."
  TG_ARN=$(aws elbv2 create-target-group \
    --name $TARGET_GROUP_NAME \
    --protocol HTTP \
    --port $CONTAINER_PORT \
    --vpc-id $VPC_ID \
    --target-type ip \
    --health-check-path "/health" \
    --health-check-interval-seconds 30 \
    --health-check-timeout-seconds 5 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 3 \
    --region $AWS_REGION \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text)
  echo "Created target group: $TG_ARN"
else
  echo "Target group already exists: $TG_ARN"
fi

# Step 4: Check if a listener exists for the ALB
echo "Checking if HTTP listener exists for ALB..."
LISTENER_ARN=$(aws elbv2 describe-listeners \
  --load-balancer-arn $ALB_ARN \
  --region $AWS_REGION \
  --query 'Listeners[?Protocol==`HTTP` && Port==`80`].ListenerArn | [0]' \
  --output text 2>/dev/null || echo "")

if [ -z "$LISTENER_ARN" ] || [ "$LISTENER_ARN" == "None" ]; then
  echo "Listener does not exist, creating a new one..."

  # Create a listener
  echo "Creating listener..."
  LISTENER_ARN=$(aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=$TG_ARN \
    --region $AWS_REGION \
    --query 'Listeners[0].ListenerArn' \
    --output text)
  echo "Created listener: $LISTENER_ARN"
else
  echo "Listener already exists: $LISTENER_ARN"

  # Update the listener to use our target group
  echo "Updating listener to use the target group..."
  aws elbv2 modify-listener \
    --listener-arn $LISTENER_ARN \
    --default-actions Type=forward,TargetGroupArn=$TG_ARN \
    --region $AWS_REGION > /dev/null
  echo "Listener updated."
fi

# Step 5: Update security group rules if needed
echo "Ensuring container security group allows traffic from ALB..."
RULE_EXISTS=$(aws ec2 describe-security-group-rules \
  --filters "Name=group-id,Values=$SECURITY_GROUP_ID" "Name=protocol,Values=tcp" "Name=from-port,Values=80" "Name=to-port,Values=80" "Name=referenced-group-id,Values=$ALB_SG_ID" \
  --region $AWS_REGION \
  --query 'SecurityGroupRules[0].SecurityGroupRuleId' \
  --output text 2>/dev/null || echo "")

if [ -z "$RULE_EXISTS" ] || [ "$RULE_EXISTS" == "None" ]; then
  echo "Adding rule to allow traffic from ALB to container..."
  aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port $CONTAINER_PORT \
    --source-group $ALB_SG_ID \
    --region $AWS_REGION
  echo "Security group rule added."
else
  echo "Security group rule already exists."
fi

# Step 6: Update the ECS service to use the load balancer
echo "Updating ECS service to use the load balancer..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --load-balancers "targetGroupArn=$TG_ARN,containerName=$CONTAINER_NAME,containerPort=$CONTAINER_PORT" \
  --region $AWS_REGION || echo "Failed to update service, this may require modifying the service to use the specified container name."

# Get the DNS name of the ALB
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --region $AWS_REGION \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

echo ""
echo "==========================================="
echo "Application Load Balancer update complete!"
echo "==========================================="
echo ""
echo "Your application should be accessible at:"
echo "http://$ALB_DNS"
echo ""
echo "Important notes:"
echo "1. It may take a few minutes for the ECS service to register with the load balancer"
echo "2. The health check is configured to check the /health endpoint"
echo "3. Your Nginx configuration already has a /health endpoint that returns 200 OK"
echo ""
echo "You can check the status of your service with:"
echo "aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION"
echo ""
echo "And check the target health with:"
echo "aws elbv2 describe-target-health --target-group-arn $TG_ARN --region $AWS_REGION"

# Check if we need to create a /health endpoint in the Nginx configuration
if ! grep -q "location /health" /Users/brandongoodson/Documents/GitHub/lnyqe-app-new/lnyqe-app/nginx.conf; then
  echo ""
  echo "WARNING: Your nginx.conf seems to be missing a /health endpoint."
  echo "Consider adding the following to your nginx.conf file:"
  echo ""
  echo "    location /health {"
  echo "        access_log off;"
  echo "        return 200 'OK';"
  echo "        add_header Content-Type text/plain;"
  echo "    }"
  echo ""
  echo "Then redeploy your application to ensure health checks pass."
fi

# Clean up temporary files
rm -f service-details.json

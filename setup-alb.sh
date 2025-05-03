#!/bin/bash
# setup-alb.sh - Create an Application Load Balancer for your ECS service

AWS_REGION="us-east-2"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"
VPC_ID=""
ALB_NAME="lynqe-app-lb"
TARGET_GROUP_NAME="lynqe-app-tg"
CONTAINER_PORT=80
CONTAINER_NAME="lynqe-app-container"

echo "Setting up Application Load Balancer for ECS service..."

# Step 1: Get VPC ID and other network information
echo "Getting VPC and network information..."
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION > service-details.json

# Extract subnet IDs
SUBNET_IDS=$(cat service-details.json | grep -A10 subnets | grep -o 'subnet-[a-zA-Z0-9]*' | paste -sd "," -)
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

# Step 2: Create a security group for the ALB
echo "Creating a security group for the load balancer..."
ALB_SG_ID=$(aws ec2 create-security-group \
  --group-name "lynqe-alb-sg" \
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

# Step 3: Create the ALB
echo "Creating Application Load Balancer..."
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name $ALB_NAME \
  --subnets $(echo $SUBNET_IDS | tr ',' ' ') \
  --security-groups $ALB_SG_ID \
  --region $AWS_REGION \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)
echo "Created ALB: $ALB_ARN"

# Step 4: Create a target group
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

# Step 5: Create a listener
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

# Step 6: Modify container security group to allow traffic from the ALB
echo "Updating container security group to allow traffic from ALB..."
aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port $CONTAINER_PORT \
  --source-group $ALB_SG_ID \
  --region $AWS_REGION

# Step 7: Update the ECS service to use the load balancer
echo "Updating ECS service to use the load balancer..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --load-balancers "targetGroupArn=$TG_ARN,containerName=$CONTAINER_NAME,containerPort=$CONTAINER_PORT" \
  --region $AWS_REGION

echo "Waiting for ALB to be active..."
aws elbv2 wait load-balancer-available \
  --load-balancer-arns $ALB_ARN \
  --region $AWS_REGION

# Get the DNS name of the ALB
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --region $AWS_REGION \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

echo ""
echo "==========================================="
echo "Application Load Balancer setup complete!"
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

# Clean up temporary files
rm -f service-details.json

#!/bin/bash
# check-ecs-network.sh - Check ECS service networking configuration

AWS_REGION="us-east-2"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"

echo "Checking ECS service networking configuration..."

# Get detailed service information
echo "Getting service details..."
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION > service-details.json

# Check network configuration
echo -e "\n=== Network Configuration ==="
NETWORK_CONFIG=$(cat service-details.json | grep -A15 networkConfiguration || echo "No network configuration found")
echo "$NETWORK_CONFIG"

# Check if the service has public IP assigned
echo -e "\n=== Public IP Assignment ==="
PUBLIC_IP=$(cat service-details.json | grep -A5 awsvpcConfiguration | grep assignPublicIp || echo "No public IP configuration found")
echo "$PUBLIC_IP"

# Check security groups
echo -e "\n=== Security Groups ==="
SECURITY_GROUPS=$(cat service-details.json | grep -A5 securityGroups || echo "No security groups found")
echo "$SECURITY_GROUPS"

# Check subnets
echo -e "\n=== Subnets ==="
SUBNETS=$(cat service-details.json | grep -A5 subnets || echo "No subnets found")
echo "$SUBNETS"

# Check task details
echo -e "\n=== Running Tasks ==="
TASKS=$(aws ecs list-tasks \
  --cluster $CLUSTER_NAME \
  --service-name $SERVICE_NAME \
  --desired-status RUNNING \
  --region $AWS_REGION \
  --query 'taskArns' \
  --output text)

if [ -z "$TASKS" ]; then
  echo "No running tasks found."
else
  # Get the first task's details
  TASK_ARN=$(echo $TASKS | cut -d' ' -f1)
  echo "Task ARN: $TASK_ARN"

  # Get task details including network interfaces and public IP
  aws ecs describe-tasks \
    --cluster $CLUSTER_NAME \
    --tasks $TASK_ARN \
    --region $AWS_REGION > task-details.json

  # Extract and display public IP if available
  PUBLIC_IP=$(cat task-details.json | grep -A5 publicIp || echo "No public IP found")
  echo "Public IP: $PUBLIC_IP"

  # Extract and display private IP
  PRIVATE_IP=$(cat task-details.json | grep -A5 privateIp || echo "No private IP found")
  echo "Private IP: $PRIVATE_IP"
fi

echo -e "\n=== Access Instructions ==="
if grep -q "assignPublicIp.*ENABLED" service-details.json; then
  echo "Your ECS service is configured with public IP addressing."
  echo "Tasks should be accessible directly if security groups allow it."

  # Extract the actual public IP if available
  PUBLIC_IP_ADDRESS=$(cat task-details.json | grep -A5 publicIp | grep -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}' || echo "Could not extract public IP")

  if [ "$PUBLIC_IP_ADDRESS" != "Could not extract public IP" ]; then
    echo "Try accessing your application at: http://$PUBLIC_IP_ADDRESS"
    echo "If you still can't access it, check the security groups to ensure they allow inbound traffic on port 80."
  else
    echo "Could not determine the public IP address of your task."
  fi
else
  echo "Your ECS service does not have public IP addressing enabled."
  echo "To access your application, you need to either:"
  echo "1. Configure a load balancer to route traffic to your ECS service"
  echo "2. Update your ECS service to enable public IP addressing"
  echo "3. Set up a VPN or AWS Direct Connect to access the private network"
fi

echo -e "\n=== Next Steps ==="
echo "Based on the findings, here are the recommended next steps:"
echo "1. Add a load balancer to your ECS service for proper public access"
echo "2. Or enable public IP assignment if you prefer direct access"
echo "3. Check security group rules to ensure they allow inbound HTTP traffic"

# Clean up temporary files
rm service-details.json task-details.json 2>/dev/null

echo -e "\nFor immediate access, the simplest solution is to configure an Application Load Balancer."
echo "Would you like me to create a script to set up an ALB for your service? (This can be executed locally)"

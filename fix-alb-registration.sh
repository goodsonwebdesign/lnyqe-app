#!/bin/bash
# fix-alb-registration.sh - Fix the registration of ECS tasks with ALB target group

set -e

# Configuration
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"
AWS_REGION="us-east-2"
TARGET_GROUP_ARN="arn:aws:elasticloadbalancing:us-east-2:872515255646:targetgroup/lynqe-app-tg/f1c492164500316b"
CONTAINER_NAME="lynqe-app-container"
CONTAINER_PORT=80

echo "Fixing ALB Target Registration..."

# Get current ECS task definition
echo "Getting current ECS task definition..."
TASK_DEF_ARN=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].taskDefinition' \
  --output text)

echo "Current task definition: $TASK_DEF_ARN"

# Ensure the service load balancer configuration is correct
echo "Updating ECS service with proper load balancer configuration..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --load-balancers "targetGroupArn=$TARGET_GROUP_ARN,containerName=$CONTAINER_NAME,containerPort=$CONTAINER_PORT" \
  --force-new-deployment \
  --region $AWS_REGION

echo "Service updated successfully with load balancer configuration."
echo "This will force a new deployment that correctly registers with the ALB."
echo "Please wait 2-5 minutes for the changes to take effect."

# Wait for the new deployment to complete
echo "Waiting for service to stabilize..."
aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION

echo "Service has stabilized. Checking target health..."

# Check target health
TARGET_HEALTH=$(aws elbv2 describe-target-health \
  --target-group-arn $TARGET_GROUP_ARN \
  --region $AWS_REGION)

echo "Current target health:"
echo "$TARGET_HEALTH" | jq .

# Check if there are targets
TARGET_COUNT=$(echo "$TARGET_HEALTH" | jq '.TargetHealthDescriptions | length')
if [ "$TARGET_COUNT" -gt 0 ]; then
  echo "✅ Success! $TARGET_COUNT targets are now registered with the ALB."
  echo "Your site should be accessible soon."
else
  echo "❌ Failed to register targets with the ALB."
  echo "Please check your ECS task definition and service configuration."
fi
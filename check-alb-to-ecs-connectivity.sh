#!/bin/bash
# check-alb-to-ecs-connectivity.sh - Verify connectivity between ALB and ECS tasks

set -e

# Configuration
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"
AWS_REGION="us-east-2"
TARGET_GROUP_NAME="lynqe-app-tg"

echo "Checking ALB to ECS connectivity..."

# Get the target group ARN
TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups \
  --names $TARGET_GROUP_NAME \
  --region $AWS_REGION \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

echo "Target Group ARN: $TARGET_GROUP_ARN"

# Get the ALB security group
LB_ARN=$(aws elbv2 describe-target-groups \
  --target-group-arns $TARGET_GROUP_ARN \
  --query 'TargetGroups[0].LoadBalancerArns[0]' \
  --output text \
  --region $AWS_REGION)

LB_SECURITY_GROUP=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $LB_ARN \
  --query 'LoadBalancers[0].SecurityGroups[0]' \
  --output text \
  --region $AWS_REGION)

echo "Load Balancer Security Group: $LB_SECURITY_GROUP"

# Get the ECS service security group
ECS_SG=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].networkConfiguration.awsvpcConfiguration.securityGroups[0]' \
  --output text)

echo "ECS Service Security Group: $ECS_SG"

# Check if the ALB security group has permission to access the ECS security group
ECS_SG_RULES=$(aws ec2 describe-security-group-rules \
  --filters "Name=group-id,Values=$ECS_SG" \
  --region $AWS_REGION)

# Check if there's an inbound rule allowing traffic from the ALB security group
if echo "$ECS_SG_RULES" | grep -q "$LB_SECURITY_GROUP"; then
  echo "✅ ECS security group has an inbound rule allowing traffic from the ALB security group."
else
  echo "❌ ECS security group does NOT have an inbound rule allowing traffic from the ALB security group."
  echo "Creating rule to allow traffic from ALB to ECS tasks..."

  aws ec2 authorize-security-group-ingress \
    --group-id $ECS_SG \
    --protocol tcp \
    --port 80 \
    --source-group $LB_SECURITY_GROUP \
    --region $AWS_REGION

  echo "Rule created successfully. ALB can now reach ECS tasks on port 80."
fi

# Check target health
echo "Checking target health in target group..."
TARGET_HEALTH=$(aws elbv2 describe-target-health \
  --target-group-arn $TARGET_GROUP_ARN \
  --region $AWS_REGION)

echo "$TARGET_HEALTH" | jq .

# Get the task ARNs
TASK_ARNS=$(aws ecs list-tasks \
  --cluster $CLUSTER_NAME \
  --service-name $SERVICE_NAME \
  --desired-status RUNNING \
  --region $AWS_REGION \
  --query 'taskArns' \
  --output text)

# Get task details including health status
if [ -n "$TASK_ARNS" ]; then
  echo "Checking task details and health status..."
  TASK_DETAILS=$(aws ecs describe-tasks \
    --cluster $CLUSTER_NAME \
    --tasks $TASK_ARNS \
    --region $AWS_REGION)

  CONTAINER_HEALTH=$(echo "$TASK_DETAILS" | jq -r '.tasks[].containers[].healthStatus')

  echo "Container health status: $CONTAINER_HEALTH"
else
  echo "No running tasks found."
fi

echo "Connectivity check completed."

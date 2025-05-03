#!/bin/bash
# update-alb-health-check.sh - Script to update load balancer health check settings

set -e

# Configuration
AWS_REGION="us-east-2"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"

echo "======================================================"
echo "UPDATING ALB HEALTH CHECK SETTINGS"
echo "======================================================"

# Step 1: Get the target group ARN from the ECS service
echo "Getting target group ARN from ECS service..."
TARGET_GROUP_ARN=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].loadBalancers[0].targetGroupArn' \
  --output text)

if [ -z "$TARGET_GROUP_ARN" ] || [ "$TARGET_GROUP_ARN" == "None" ]; then
  echo "Failed to get target group ARN. Check your ECS service configuration."
  exit 1
fi

echo "Target Group ARN: $TARGET_GROUP_ARN"

# Step 2: Get current health check settings
echo "Current health check settings:"
CURRENT_SETTINGS=$(aws elbv2 describe-target-groups \
  --target-group-arns $TARGET_GROUP_ARN \
  --region $AWS_REGION)

CURRENT_PATH=$(echo $CURRENT_SETTINGS | jq -r '.TargetGroups[0].HealthCheckPath')
CURRENT_PORT=$(echo $CURRENT_SETTINGS | jq -r '.TargetGroups[0].HealthCheckPort')
CURRENT_PROTOCOL=$(echo $CURRENT_SETTINGS | jq -r '.TargetGroups[0].HealthCheckProtocol')
CURRENT_INTERVAL=$(echo $CURRENT_SETTINGS | jq -r '.TargetGroups[0].HealthCheckIntervalSeconds')
CURRENT_TIMEOUT=$(echo $CURRENT_SETTINGS | jq -r '.TargetGroups[0].HealthCheckTimeoutSeconds')
CURRENT_HEALTHY_THRESHOLD=$(echo $CURRENT_SETTINGS | jq -r '.TargetGroups[0].HealthyThresholdCount')
CURRENT_UNHEALTHY_THRESHOLD=$(echo $CURRENT_SETTINGS | jq -r '.TargetGroups[0].UnhealthyThresholdCount')

echo "Path: $CURRENT_PATH"
echo "Port: $CURRENT_PORT"
echo "Protocol: $CURRENT_PROTOCOL"
echo "Interval: $CURRENT_INTERVAL seconds"
echo "Timeout: $CURRENT_TIMEOUT seconds"
echo "Healthy Threshold: $CURRENT_HEALTHY_THRESHOLD"
echo "Unhealthy Threshold: $CURRENT_UNHEALTHY_THRESHOLD"

# Step 3: Prompt for new settings or use defaults
read -p "Update health check path? (default: / for Angular apps) [y/N]: " UPDATE_PATH
if [[ $UPDATE_PATH =~ ^[Yy]$ ]]; then
  read -p "Enter new health check path (default: /): " NEW_PATH
  NEW_PATH=${NEW_PATH:-"/"}
else
  NEW_PATH=$CURRENT_PATH
fi

read -p "Increase health check timeout? (recommended for Angular apps) [y/N]: " UPDATE_TIMEOUT
if [[ $UPDATE_TIMEOUT =~ ^[Yy]$ ]]; then
  read -p "Enter new timeout in seconds (recommended: 10): " NEW_TIMEOUT
  NEW_TIMEOUT=${NEW_TIMEOUT:-10}
else
  NEW_TIMEOUT=$CURRENT_TIMEOUT
fi

read -p "Increase health check interval? [y/N]: " UPDATE_INTERVAL
if [[ $UPDATE_INTERVAL =~ ^[Yy]$ ]]; then
  read -p "Enter new interval in seconds (recommended: 30): " NEW_INTERVAL
  NEW_INTERVAL=${NEW_INTERVAL:-30}
else
  NEW_INTERVAL=$CURRENT_INTERVAL
fi

read -p "Reduce healthy threshold? [y/N]: " UPDATE_HEALTHY
if [[ $UPDATE_HEALTHY =~ ^[Yy]$ ]]; then
  read -p "Enter new healthy threshold count (recommended: 2): " NEW_HEALTHY
  NEW_HEALTHY=${NEW_HEALTHY:-2}
else
  NEW_HEALTHY=$CURRENT_HEALTHY_THRESHOLD
fi

read -p "Reduce unhealthy threshold? [y/N]: " UPDATE_UNHEALTHY
if [[ $UPDATE_UNHEALTHY =~ ^[Yy]$ ]]; then
  read -p "Enter new unhealthy threshold count (recommended: 3): " NEW_UNHEALTHY
  NEW_UNHEALTHY=${NEW_UNHEALTHY:-3}
else
  NEW_UNHEALTHY=$CURRENT_UNHEALTHY_THRESHOLD
fi

# Step 4: Confirm changes before applying
echo -e "\nChanges to be applied:"
if [ "$NEW_PATH" != "$CURRENT_PATH" ]; then
  echo "- Health check path: $CURRENT_PATH -> $NEW_PATH"
fi

if [ "$NEW_TIMEOUT" != "$CURRENT_TIMEOUT" ]; then
  echo "- Timeout: $CURRENT_TIMEOUT -> $NEW_TIMEOUT seconds"
fi

if [ "$NEW_INTERVAL" != "$CURRENT_INTERVAL" ]; then
  echo "- Interval: $CURRENT_INTERVAL -> $NEW_INTERVAL seconds"
fi

if [ "$NEW_HEALTHY" != "$CURRENT_HEALTHY_THRESHOLD" ]; then
  echo "- Healthy threshold: $CURRENT_HEALTHY_THRESHOLD -> $NEW_HEALTHY"
fi

if [ "$NEW_UNHEALTHY" != "$CURRENT_UNHEALTHY_THRESHOLD" ]; then
  echo "- Unhealthy threshold: $CURRENT_UNHEALTHY_THRESHOLD -> $NEW_UNHEALTHY"
fi

read -p "Apply these changes? [y/N]: " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
  echo "Changes not applied. Exiting."
  exit 0
fi

# Step 5: Apply the new settings
echo "Updating health check settings..."
aws elbv2 modify-target-group \
  --target-group-arn $TARGET_GROUP_ARN \
  --health-check-protocol $CURRENT_PROTOCOL \
  --health-check-port $CURRENT_PORT \
  --health-check-path "$NEW_PATH" \
  --health-check-interval-seconds $NEW_INTERVAL \
  --health-check-timeout-seconds $NEW_TIMEOUT \
  --healthy-threshold-count $NEW_HEALTHY \
  --unhealthy-threshold-count $NEW_UNHEALTHY \
  --region $AWS_REGION

echo "Health check settings updated successfully!"

# Step 6: Verify the new settings
echo -e "\nVerifying new settings:"
NEW_SETTINGS=$(aws elbv2 describe-target-groups \
  --target-group-arns $TARGET_GROUP_ARN \
  --region $AWS_REGION)

NEW_PATH_ACTUAL=$(echo $NEW_SETTINGS | jq -r '.TargetGroups[0].HealthCheckPath')
NEW_TIMEOUT_ACTUAL=$(echo $NEW_SETTINGS | jq -r '.TargetGroups[0].HealthCheckTimeoutSeconds')
NEW_INTERVAL_ACTUAL=$(echo $NEW_SETTINGS | jq -r '.TargetGroups[0].HealthCheckIntervalSeconds')
NEW_HEALTHY_ACTUAL=$(echo $NEW_SETTINGS | jq -r '.TargetGroups[0].HealthyThresholdCount')
NEW_UNHEALTHY_ACTUAL=$(echo $NEW_SETTINGS | jq -r '.TargetGroups[0].UnhealthyThresholdCount')

echo "Path: $NEW_PATH_ACTUAL"
echo "Timeout: $NEW_TIMEOUT_ACTUAL seconds"
echo "Interval: $NEW_INTERVAL_ACTUAL seconds"
echo "Healthy Threshold: $NEW_HEALTHY_ACTUAL"
echo "Unhealthy Threshold: $NEW_UNHEALTHY_ACTUAL"

echo -e "\nHealth check updated! Your ECS service should now have an easier time passing health checks."
echo "If you're still having issues, you may need to create a /health endpoint in your Angular application."

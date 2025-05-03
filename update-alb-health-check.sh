#!/bin/bash
# update-alb-health-check.sh - Configure ALB target group health check settings

set -e

# Configuration
AWS_REGION="us-east-2"

echo "Updating ALB target group health check settings..."

# Find the target group ARN
TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups \
  --query "TargetGroups[?contains(TargetGroupArn, 'lynqe')].TargetGroupArn" \
  --output text \
  --region $AWS_REGION)

if [ -z "$TARGET_GROUP_ARN" ]; then
  echo "Error: Target group not found."
  exit 1
fi

echo "Found target group: $TARGET_GROUP_ARN"

# Update target group health check settings
echo "Updating health check settings..."
aws elbv2 modify-target-group \
  --target-group-arn $TARGET_GROUP_ARN \
  --health-check-protocol HTTP \
  --health-check-port traffic-port \
  --health-check-path /health \
  --health-check-enabled \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --matcher "HttpCode=200" \
  --region $AWS_REGION

echo "Health check settings updated successfully!"
echo "New settings:"
aws elbv2 describe-target-group-attributes \
  --target-group-arn $TARGET_GROUP_ARN \
  --region $AWS_REGION

echo "Checking target health status (wait a few minutes to see effects):"
aws elbv2 describe-target-health \
  --target-group-arn $TARGET_GROUP_ARN \
  --region $AWS_REGION

echo "Done! Your ALB health check is now configured to use the /health endpoint."
echo "If you're still experiencing issues, check container logs with:"
echo "./check-container-logs.sh"

#!/bin/bash
# ecs-simple-debug.sh - Simplified script to diagnose ECS task failures

# Configuration
AWS_REGION="us-east-2"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"
LOG_GROUP_NAME="/ecs/lynqe-app"

echo "========================================================"
echo "SIMPLIFIED ECS TASK DEBUGGING"
echo "========================================================"

echo "1. Checking service status..."
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].[serviceName,status,desiredCount,runningCount,pendingCount]' \
  --output text

echo -e "\n2. Recent deployment status:"
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].deployments[0].[status,rolloutState,rolloutStateReason,desiredCount,runningCount,pendingCount]' \
  --output text

echo -e "\n3. Finding recently stopped tasks..."
STOPPED_TASKS=$(aws ecs list-tasks \
  --cluster $CLUSTER_NAME \
  --desired-status STOPPED \
  --region $AWS_REGION \
  --output text)

if [ -z "$STOPPED_TASKS" ]; then
  echo "No stopped tasks found - checking active tasks"
  TASKS=$(aws ecs list-tasks \
    --cluster $CLUSTER_NAME \
    --region $AWS_REGION \
    --output text)
else
  echo "Found stopped tasks: $STOPPED_TASKS"
  TASKS=$STOPPED_TASKS
fi

echo -e "\n4. Analyzing task details (up to 3 most recent tasks):"
TASK_COUNT=0
for TASK_ARN in $TASKS; do
  if [ $TASK_COUNT -ge 3 ]; then
    break
  fi

  echo -e "\nTask ARN: $TASK_ARN"

  # Get task details
  aws ecs describe-tasks \
    --cluster $CLUSTER_NAME \
    --tasks $TASK_ARN \
    --region $AWS_REGION \
    --query 'tasks[0].[taskDefinitionArn,lastStatus,stoppedReason,healthStatus,connectivity]' \
    --output text

  # Get container details
  echo "Container details:"
  aws ecs describe-tasks \
    --cluster $CLUSTER_NAME \
    --tasks $TASK_ARN \
    --region $AWS_REGION \
    --query 'tasks[0].containers[0].[name,lastStatus,exitCode,reason]' \
    --output text

  # Get logs if available
  TASK_ID=$(echo $TASK_ARN | awk -F'/' '{print $3}')
  echo "Checking logs for task: $TASK_ID"
  LOG_STREAM="ecs/lynqe-app-container/$TASK_ID"

  # Check if log stream exists
  if aws logs describe-log-streams \
    --log-group-name $LOG_GROUP_NAME \
    --log-stream-name-prefix "$LOG_STREAM" \
    --region $AWS_REGION \
    --query 'logStreams[0].logStreamName' \
    --output text 2>/dev/null | grep -q "$LOG_STREAM"; then

    echo "Found logs, showing last 20 log lines:"
    aws logs get-log-events \
      --log-group-name $LOG_GROUP_NAME \
      --log-stream-name "$LOG_STREAM" \
      --limit 20 \
      --region $AWS_REGION \
      --query 'events[*].message' \
      --output text
  else
    echo "No logs found for this task"
  fi

  TASK_COUNT=$((TASK_COUNT + 1))
done

echo -e "\n5. Checking HTTPS configuration on load balancer..."
# Get target group ARN
TARGET_GROUP_ARN=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].loadBalancers[0].targetGroupArn' \
  --output text)

if [ -n "$TARGET_GROUP_ARN" ] && [ "$TARGET_GROUP_ARN" != "None" ]; then
  echo "Target Group ARN: $TARGET_GROUP_ARN"

  # Get load balancer ARN
  LB_ARN=$(aws elbv2 describe-target-groups \
    --target-group-arns $TARGET_GROUP_ARN \
    --region $AWS_REGION \
    --query 'TargetGroups[0].LoadBalancerArns[0]' \
    --output text)

  echo "Load Balancer ARN: $LB_ARN"

  # Check HTTPS listener
  HTTPS_LISTENER=$(aws elbv2 describe-listeners \
    --load-balancer-arn $LB_ARN \
    --region $AWS_REGION \
    --query "Listeners[?Port==\`443\`].ListenerArn" \
    --output text)

  if [ -n "$HTTPS_LISTENER" ] && [ "$HTTPS_LISTENER" != "None" ]; then
    echo "HTTPS listener is configured"
  else
    echo "WARNING: No HTTPS listener found on port 443"
  fi

  # Check health check config
  echo "Health check configuration:"
  aws elbv2 describe-target-groups \
    --target-group-arns $TARGET_GROUP_ARN \
    --region $AWS_REGION \
    --query 'TargetGroups[0].{Path:HealthCheckPath,Port:HealthCheckPort,Protocol:HealthCheckProtocol,Interval:HealthCheckIntervalSeconds,Timeout:HealthCheckTimeoutSeconds}' \
    --output text
fi

echo -e "\n6. Health check configuration analysis:"
# Check if health check path is valid
HEALTH_PATH=$(aws elbv2 describe-target-groups \
  --target-group-arns $TARGET_GROUP_ARN \
  --region $AWS_REGION \
  --query 'TargetGroups[0].HealthCheckPath' \
  --output text)

echo "Health check path: $HEALTH_PATH"
echo "Common issues:"

if [ "$HEALTH_PATH" != "/" ] && [ "$HEALTH_PATH" != "/health" ]; then
  echo "- Non-standard health check path. Make sure this endpoint exists in your application."
fi

echo "- Health check might be too strict. Consider increasing thresholds and timeout."
echo "- Your container may not be starting correctly. Check Dockerfile and entry point."
echo "- Auth0 configuration may be incorrect for HTTPS."

echo -e "\n7. Troubleshooting recommendations:"
echo "1. Check if your application has a health endpoint that matches: $HEALTH_PATH"
echo "2. Verify that your Nginx configuration serves this health path correctly"
echo "3. Check for errors in container startup or configuration"
echo "4. Verify Auth0 is configured for HTTPS URLs (https://lynqe.io/callback)"
echo "5. Examine the security groups to ensure proper access"

echo "========================================================"
echo "To fix HTTPS-related issues, run: ./setup-https.sh"
echo "========================================================"

#!/bin/bash
# debug-ecs-tasks.sh - Script to diagnose why ECS tasks are failing to start

set -e

# Configuration
AWS_REGION="us-east-2"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"
LOG_GROUP_NAME="/ecs/lynqe-app"

echo "======================================================"
echo "ECS Task Debugging Tool for LNYQE App"
echo "======================================================"

# Get the most recent stopped tasks
echo "Fetching recently stopped tasks..."
STOPPED_TASKS=$(aws ecs list-tasks \
  --cluster $CLUSTER_NAME \
  --desired-status STOPPED \
  --region $AWS_REGION \
  --output json)

TASK_ARNS=$(echo $STOPPED_TASKS | jq -r '.taskArns[]')

if [ -z "$TASK_ARNS" ]; then
  echo "No stopped tasks found. Let's check for failed deployments instead."

  # Check service events for clues about deployment failures
  SERVICE_EVENTS=$(aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION \
    --query 'services[0].events[0:10]' \
    --output json)

  echo "Recent service events:"
  echo $SERVICE_EVENTS | jq -r '.[] | .message'

  echo "Checking service definition for possible issues..."
  aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION > service.json

  # Extract task definition ARN
  TASK_DEF_ARN=$(jq -r '.services[0].taskDefinition' service.json)
  echo "Current task definition: $TASK_DEF_ARN"

  # Get task definition details
  echo "Checking task definition for issues..."
  aws ecs describe-task-definition \
    --task-definition $TASK_DEF_ARN \
    --region $AWS_REGION > taskdef.json

  # Check for common issues
  IMAGE=$(jq -r '.taskDefinition.containerDefinitions[0].image' taskdef.json)
  CONTAINER_PORT=$(jq -r '.taskDefinition.containerDefinitions[0].portMappings[0].containerPort' taskdef.json)
  MEMORY=$(jq -r '.taskDefinition.containerDefinitions[0].memory' taskdef.json)
  CPU=$(jq -r '.taskDefinition.containerDefinitions[0].cpu' taskdef.json)

  echo "Container image: $IMAGE"
  echo "Container port: $CONTAINER_PORT"
  echo "Memory allocation: $MEMORY"
  echo "CPU allocation: $CPU"

  # Check image exists in ECR
  echo "Verifying image exists in ECR..."
  REPO_NAME=$(echo $IMAGE | cut -d'/' -f2 | cut -d':' -f1)
  TAG=$(echo $IMAGE | cut -d':' -f2)

  if aws ecr describe-images \
    --repository-name $REPO_NAME \
    --image-ids imageTag=$TAG \
    --region $AWS_REGION 2>/dev/null; then
    echo "✅ Image exists in ECR"
  else
    echo "❌ ERROR: Image does not exist in ECR. This is likely the cause of your task failures."
    echo "Possible solution: Check that the Docker image build and push was successful."
  fi

  # Health check configuration
  echo "Checking health check configuration..."
  HEALTH_CHECK=$(jq -r '.taskDefinition.containerDefinitions[0].healthCheck' taskdef.json)
  if [ "$HEALTH_CHECK" != "null" ]; then
    echo "Health check configuration:"
    echo $HEALTH_CHECK | jq '.'

    # Check if health check is overly strict
    RETRIES=$(echo $HEALTH_CHECK | jq -r '.retries')
    TIMEOUT=$(echo $HEALTH_CHECK | jq -r '.timeout')
    INTERVAL=$(echo $HEALTH_CHECK | jq -r '.interval')

    if [ "$RETRIES" -lt 3 ] || [ "$TIMEOUT" -lt 5 ] || [ "$INTERVAL" -lt 30 ]; then
      echo "⚠️ Warning: Health check parameters may be too strict."
      echo "Recommendation: Consider increasing retries, timeout, or interval."
    fi
  else
    echo "No health check configured."
  fi

  echo "Checking Application Load Balancer configuration..."
  TARGET_GROUP_ARN=$(jq -r '.services[0].loadBalancers[0].targetGroupArn' service.json)
  if [ -n "$TARGET_GROUP_ARN" ] && [ "$TARGET_GROUP_ARN" != "null" ]; then
    aws elbv2 describe-target-group-attributes \
      --target-group-arn $TARGET_GROUP_ARN \
      --region $AWS_REGION

    # Check if ALB health check is too strict
    TG_HEALTH=$(aws elbv2 describe-target-groups \
      --target-group-arns $TARGET_GROUP_ARN \
      --region $AWS_REGION)

    HEALTH_PATH=$(echo $TG_HEALTH | jq -r '.TargetGroups[0].HealthCheckPath')
    THRESHOLD=$(echo $TG_HEALTH | jq -r '.TargetGroups[0].HealthyThresholdCount')
    INTERVAL=$(echo $TG_HEALTH | jq -r '.TargetGroups[0].HealthCheckIntervalSeconds')

    echo "ALB health check path: $HEALTH_PATH"
    echo "ALB healthy threshold: $THRESHOLD"
    echo "ALB health check interval: $INTERVAL"

    if [ "$HEALTH_PATH" != "/health" ]; then
      echo "⚠️ Warning: ALB health check path is not '/health'. Your Nginx is configured for /health."
      echo "Recommendation: Update ALB health check path to '/health'."
    fi
  fi

  echo "Checking for issues in Nginx configuration..."
  echo "Your current Nginx configuration should have a /health endpoint. Verify it does."
else
  echo "Found stopped tasks. Analyzing failure reasons..."

  for TASK_ARN in $TASK_ARNS; do
    TASK_ID=$(echo $TASK_ARN | cut -d'/' -f3)
    echo "Task ID: $TASK_ID"

    echo "Getting task details..."
    TASK_DETAILS=$(aws ecs describe-tasks \
      --cluster $CLUSTER_NAME \
      --tasks $TASK_ARN \
      --region $AWS_REGION)

    # Get the stop reason
    STOP_REASON=$(echo $TASK_DETAILS | jq -r '.tasks[0].stoppedReason')
    echo "Stop reason: $STOP_REASON"

    # Get container exit codes
    echo "Container details:"
    echo $TASK_DETAILS | jq -r '.tasks[0].containers[] | {name: .name, exitCode: .exitCode, reason: .reason}'

    # Try to get logs if available
    echo "Checking CloudWatch logs for task $TASK_ID..."
    LOG_STREAMS=$(aws logs describe-log-streams \
      --log-group-name $LOG_GROUP_NAME \
      --log-stream-name-prefix "ecs/lynqe-app-container/$TASK_ID" \
      --region $AWS_REGION \
      --output json)

    STREAM_NAME=$(echo $LOG_STREAMS | jq -r '.logStreams[0].logStreamName')

    if [ -n "$STREAM_NAME" ] && [ "$STREAM_NAME" != "null" ]; then
      echo "Found log stream: $STREAM_NAME"
      echo "Latest logs:"
      aws logs get-log-events \
        --log-group-name $LOG_GROUP_NAME \
        --log-stream-name "$STREAM_NAME" \
        --limit 30 \
        --region $AWS_REGION | jq -r '.events[].message'
    else
      echo "No log stream found for this task."
    fi

    echo "----------------------------------------------------"
  done
fi

echo "======================================================"
echo "Troubleshooting recommendations:"
echo "1. Check your Docker image and verify it can start properly"
echo "2. Ensure your health check endpoints (/health) are configured correctly"
echo "3. Increase memory/CPU if container is running out of resources"
echo "4. Check that HTTPS configuration is correct (Auth0 requires HTTPS)"
echo "5. Consider temporarily disabling health checks to see if container starts"
echo "======================================================"

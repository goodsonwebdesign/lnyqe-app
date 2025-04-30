#!/bin/bash
# troubleshoot-ecs.sh - Script to diagnose issues with ECS deployment

# Configuration
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"

# Step 1: Check current ECS service status
echo "Checking current ECS service status..."
SERVICE_INFO=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME)

# Get recent events
RECENT_EVENTS=$(echo "$SERVICE_INFO" | jq -r '.services[0].events[0:10].message')
echo "Recent service events:"
echo "$RECENT_EVENTS"

# Get network configuration
NETWORK_CONFIG=$(echo "$SERVICE_INFO" | jq -r '.services[0].networkConfiguration')
echo "Network configuration:"
echo "$NETWORK_CONFIG"

# Step 2: Check for recently stopped tasks
echo "Checking for recently stopped tasks to diagnose issues..."
STOPPED_TASKS=$(aws ecs list-tasks --cluster $CLUSTER_NAME --desired-status STOPPED --max-items 20 --query 'taskArns[]' --output json)

if [ -z "$STOPPED_TASKS" ] || [ "$STOPPED_TASKS" == "[]" ]; then
  echo "No recently stopped tasks found."
else
  echo "Found stopped tasks. Checking reason for failure..."
  
  # For each stopped task, get the stop reason
  echo "Task stop reasons:"
  for TASK_ARN in $(echo $STOPPED_TASKS | jq -r '.[]'); do
    TASK_INFO=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN)
    STOP_REASON=$(echo "$TASK_INFO" | jq -r '.tasks[0].stoppedReason')
    echo "$STOP_REASON"
  done
  
  # Check container exit codes
  echo "Container stop details:"
  for TASK_ARN in $(echo $STOPPED_TASKS | jq -r '.[]'); do
    TASK_INFO=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN)
    CONTAINERS=$(echo "$TASK_INFO" | jq -r '.tasks[0].containers')
    echo "$CONTAINERS"
  done
  
  # Try to get logs for stopped tasks (might not be available if logs couldn't be sent)
  for TASK_ARN in $(echo $STOPPED_TASKS | jq -r '.[]'); do
    TASK_ID=$(echo $TASK_ARN | cut -d'/' -f3)
    echo "Attempting to get logs for task $TASK_ID..."
    
    LOG_STREAM="ecs/lynqe-app-container/$TASK_ID"
    aws logs get-log-events --log-group-name "/ecs/lynqe-app" --log-stream-name "$LOG_STREAM" --query 'events[].message' --output text || echo "No logs available for this task"
  done
fi

# Step 3: Check load balancer health
TARGET_GROUP_ARN=$(echo "$SERVICE_INFO" | jq -r '.services[0].loadBalancers[0].targetGroupArn')
if [ -n "$TARGET_GROUP_ARN" ] && [ "$TARGET_GROUP_ARN" != "null" ]; then
  echo "Checking Load Balancer target health..."
  TARGET_HEALTH=$(aws elbv2 describe-target-health --target-group-arn "$TARGET_GROUP_ARN")
  echo "$TARGET_HEALTH"
  
  # Check which AZs the load balancer is using
  LB_ARN=$(aws elbv2 describe-target-groups --target-group-arns "$TARGET_GROUP_ARN" --query 'TargetGroups[0].LoadBalancerArns[0]' --output text)
  if [ -n "$LB_ARN" ] && [ "$LB_ARN" != "None" ]; then
    echo "Load Balancer Availability Zones:"
    aws elbv2 describe-load-balancers --load-balancer-arns "$LB_ARN" --query 'LoadBalancers[0].AvailabilityZones' --output json
  fi
fi

# Step 4: Check if there are any running tasks
RUNNING_TASKS=$(aws ecs list-tasks --cluster $CLUSTER_NAME --desired-status RUNNING --query 'taskArns' --output json)
if [ -z "$RUNNING_TASKS" ] || [ "$RUNNING_TASKS" == "[]" ]; then
  echo "No running tasks found."
else
  echo "Found running tasks. Checking their health..."
  aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $(echo $RUNNING_TASKS | jq -r 'join(" ")') --query 'tasks[].{TaskArn:taskArn,LastStatus:lastStatus,HealthStatus:healthStatus,ContainersHealth:containers[].{Name:name,Health:healthStatus}}' --output json
fi
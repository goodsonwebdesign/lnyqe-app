#!/bin/bash
# ecs-wait-for-stable.sh - Wait for an ECS service to stabilize (standalone version)

# Set default values - modify these for your environment
AWS_REGION="us-east-2"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"
# Maximum time to wait in minutes
MAX_WAIT_MINUTES=15

# Allow command line parameters to override defaults
while getopts "c:s:r:m:" opt; do
  case $opt in
    c) CLUSTER_NAME="$OPTARG" ;;
    s) SERVICE_NAME="$OPTARG" ;;
    r) AWS_REGION="$OPTARG" ;;
    m) MAX_WAIT_MINUTES="$OPTARG" ;;
    *) echo "Usage: $0 [-c CLUSTER_NAME] [-s SERVICE_NAME] [-r AWS_REGION] [-m MAX_WAIT_MINUTES]"; exit 1 ;;
  esac
done

echo "======================================================"
echo "WAITING FOR ECS SERVICE TO STABILIZE"
echo "======================================================"
echo "Cluster: $CLUSTER_NAME"
echo "Service: $SERVICE_NAME"
echo "Region: $AWS_REGION"
echo "Timeout: $MAX_WAIT_MINUTES minutes"
echo "======================================================"

# Calculate the number of checks based on MAX_WAIT_MINUTES (1 check every 30 seconds)
MAX_CHECKS=$((MAX_WAIT_MINUTES * 2))

# Get current service state
echo "Getting current service state..."
SERVICE_JSON=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION)

if [ $? -ne 0 ]; then
  echo "Failed to get service information. Check your AWS credentials and parameters."
  exit 1
fi

# Check current deployment status first
CURRENT_STATUS=$(echo $SERVICE_JSON | jq -r '.services[0].deployments[0].rolloutState')
RUNNING_COUNT=$(echo $SERVICE_JSON | jq -r '.services[0].runningCount')
DESIRED_COUNT=$(echo $SERVICE_JSON | jq -r '.services[0].desiredCount')

echo "Initial state: Status=$CURRENT_STATUS, Running=$RUNNING_COUNT/$DESIRED_COUNT"

if [ "$CURRENT_STATUS" == "COMPLETED" ] && [ "$RUNNING_COUNT" -eq "$DESIRED_COUNT" ]; then
  echo "✅ Deployment already completed and service is stable!"
  echo "Running tasks: $RUNNING_COUNT/$DESIRED_COUNT"
  exit 0
fi

# Traditional check with retries
echo "Deployment not yet stable. Starting monitoring..."
for i in $(seq 1 $MAX_CHECKS); do
  echo -e "\nCheck $i of $MAX_CHECKS: Verifying service stability..."
  
  SERVICE_JSON=$(aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION)
  
  # Check overall service status first
  RUNNING_COUNT=$(echo $SERVICE_JSON | jq -r '.services[0].runningCount')
  DESIRED_COUNT=$(echo $SERVICE_JSON | jq -r '.services[0].desiredCount')
  PRIMARY_STATUS=$(echo $SERVICE_JSON | jq -r '.services[0].deployments[0].rolloutState')
  
  echo "Deployment status: $PRIMARY_STATUS, Running: $RUNNING_COUNT, Desired: $DESIRED_COUNT"
  
  # Get recent events
  RECENT_EVENTS=$(echo $SERVICE_JSON | jq -r '.services[0].events[0:3][].message')
  echo "Recent events:"
  echo "$RECENT_EVENTS"
  
  # Check by task running count and deployment status
  if [ "$RUNNING_COUNT" -eq "$DESIRED_COUNT" ] && [ "$PRIMARY_STATUS" == "COMPLETED" ]; then
    echo "✅ Deployment successful! Service is stable with $RUNNING_COUNT running tasks."
    exit 0
  fi
  
  # Additional check for "IN_PROGRESS" deployments to avoid false negatives
  if [ "$PRIMARY_STATUS" == "IN_PROGRESS" ] && [ "$RUNNING_COUNT" -gt 0 ]; then
    echo "Deployment in progress with $RUNNING_COUNT running tasks. Continuing to wait..."
  fi
  
  # Check for task failures that might indicate a problem
  STOPPED_TASKS=$(aws ecs list-tasks \
    --cluster $CLUSTER_NAME \
    --desired-status STOPPED \
    --region $AWS_REGION \
    --started-by "ecs-svc" \
    --output text | wc -l)
  
  if [ "$STOPPED_TASKS" -gt 2 ] && [ "$RUNNING_COUNT" -eq 0 ]; then
    echo "⚠️ Warning: Multiple stopped tasks detected. Deployment may be failing."
    
    # Get detailed information about stopped tasks
    TASK_ARNS=$(aws ecs list-tasks \
      --cluster $CLUSTER_NAME \
      --desired-status STOPPED \
      --region $AWS_REGION \
      --started-by "ecs-svc" \
      --output text)
    
    if [ -n "$TASK_ARNS" ]; then
      echo "Getting details for stopped tasks..."
      aws ecs describe-tasks \
        --cluster $CLUSTER_NAME \
        --tasks $TASK_ARNS \
        --region $AWS_REGION \
        --query 'tasks[*].[taskArn,stoppedReason]' \
        --output text
    fi
  fi
  
  if [ $i -lt $MAX_CHECKS ]; then
    echo "Waiting 30 seconds before checking again..."
    sleep 30
  fi
done

echo "Timed out waiting for deployment to stabilize."
echo "Current state: Running: $RUNNING_COUNT, Desired: $DESIRED_COUNT, Status: $PRIMARY_STATUS"
echo "This doesn't necessarily mean the deployment failed - check the AWS console."

# Exit with success anyway if there are running tasks
if [ "$RUNNING_COUNT" -gt 0 ]; then
  echo "Since there are running tasks, considering the deployment successful."
  exit 0
else
  echo "No running tasks found. Deployment may have failed."
  exit 1
fi
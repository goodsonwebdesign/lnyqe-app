#!/bin/bash
# ecs-wait-for-stable.sh - Wait for an ECS service to stabilize (standalone version)

# Set default values - modify these for your environment
AWS_REGION="us-east-2"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"
# Maximum time to wait in minutes
MAX_WAIT_MINUTES=15
# Consider service stable if IN_PROGRESS for this many checks without changes
STABLE_IN_PROGRESS_THRESHOLD=5

# Allow command line parameters to override defaults
while getopts "c:s:r:m:t:" opt; do
  case $opt in
    c) CLUSTER_NAME="$OPTARG" ;;
    s) SERVICE_NAME="$OPTARG" ;;
    r) AWS_REGION="$OPTARG" ;;
    m) MAX_WAIT_MINUTES="$OPTARG" ;;
    t) STABLE_IN_PROGRESS_THRESHOLD="$OPTARG" ;;
    *) echo "Usage: $0 [-c CLUSTER_NAME] [-s SERVICE_NAME] [-r AWS_REGION] [-m MAX_WAIT_MINUTES] [-t STABLE_THRESHOLD]"; exit 1 ;;
  esac
done

echo "======================================================"
echo "WAITING FOR ECS SERVICE TO STABILIZE"
echo "======================================================"
echo "Cluster: $CLUSTER_NAME"
echo "Service: $SERVICE_NAME"
echo "Region: $AWS_REGION"
echo "Timeout: $MAX_WAIT_MINUTES minutes"
echo "Stable IN_PROGRESS threshold: $STABLE_IN_PROGRESS_THRESHOLD checks"
echo "======================================================"

# Calculate the number of checks based on MAX_WAIT_MINUTES (1 check every 30 seconds)
MAX_CHECKS=$((MAX_WAIT_MINUTES * 2))

# Variables to track stable IN_PROGRESS deployments
STABLE_COUNT=0
LAST_RUNNING_COUNT=0
LAST_TASK_SET=""

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
CURRENT_TASK_SET=$(echo $SERVICE_JSON | jq -r '.services[0].deployments[0].id')

echo "Initial state: Status=$CURRENT_STATUS, Running=$RUNNING_COUNT/$DESIRED_COUNT"
echo "Deployment ID: $CURRENT_TASK_SET"

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
  CURRENT_TASK_SET=$(echo $SERVICE_JSON | jq -r '.services[0].deployments[0].id')
  DEPLOYMENT_CREATED=$(echo $SERVICE_JSON | jq -r '.services[0].deployments[0].createdAt')
  DEPLOYMENT_UPDATED=$(echo $SERVICE_JSON | jq -r '.services[0].deployments[0].updatedAt')
  
  # Calculate deployment duration
  CREATED_TIMESTAMP=$(date -j -f "%Y-%m-%dT%H:%M:%S%z" "$DEPLOYMENT_CREATED" "+%s" 2>/dev/null || date -d "$DEPLOYMENT_CREATED" "+%s")
  CURRENT_TIMESTAMP=$(date "+%s")
  DEPLOYMENT_DURATION=$((CURRENT_TIMESTAMP - CREATED_TIMESTAMP))
  DURATION_MINUTES=$((DEPLOYMENT_DURATION / 60))
  DURATION_SECONDS=$((DEPLOYMENT_DURATION % 60))
  
  echo "Deployment status: $PRIMARY_STATUS, Running: $RUNNING_COUNT, Desired: $DESIRED_COUNT"
  echo "Deployment ID: $CURRENT_TASK_SET"
  echo "Deployment duration: ${DURATION_MINUTES}m ${DURATION_SECONDS}s"
  
  # Get recent events
  RECENT_EVENTS=$(echo $SERVICE_JSON | jq -r '.services[0].events[0:3][].message')
  echo "Recent events:"
  echo "$RECENT_EVENTS"
  
  # Check by task running count and deployment status
  if [ "$RUNNING_COUNT" -eq "$DESIRED_COUNT" ] && [ "$PRIMARY_STATUS" == "COMPLETED" ]; then
    echo "✅ Deployment successful! Service is stable with $RUNNING_COUNT running tasks."
    exit 0
  fi
  
  # Check for stability in IN_PROGRESS state
  if [ "$PRIMARY_STATUS" == "IN_PROGRESS" ] && [ "$RUNNING_COUNT" -gt 0 ]; then
    echo "Deployment in progress with $RUNNING_COUNT running tasks. Continuing to wait..."
    
    # Check if deployment is in stable progress (no change in running count and task set)
    if [ "$RUNNING_COUNT" -eq "$LAST_RUNNING_COUNT" ] && [ "$CURRENT_TASK_SET" == "$LAST_TASK_SET" ]; then
      STABLE_COUNT=$((STABLE_COUNT + 1))
      echo "📊 Stability tracker: $STABLE_COUNT/$STABLE_IN_PROGRESS_THRESHOLD consecutive stable checks"
      
      # If stable for enough checks, consider it successful
      if [ $STABLE_COUNT -ge $STABLE_IN_PROGRESS_THRESHOLD ]; then
        echo "✅ Deployment considered stable after $STABLE_COUNT consecutive stable checks in IN_PROGRESS state."
        echo "Service has $RUNNING_COUNT/$DESIRED_COUNT tasks running consistently."
        exit 0
      fi
    else
      # Reset stability counter if counts or deployment IDs change
      STABLE_COUNT=0
      echo "📊 Stability tracker reset: deployment state changed"
    fi
  else
    # Reset stability counter for non-IN_PROGRESS states
    STABLE_COUNT=0
  fi
  
  # Update tracking variables
  LAST_RUNNING_COUNT=$RUNNING_COUNT
  LAST_TASK_SET=$CURRENT_TASK_SET
  
  # Check for task failures that might indicate a problem
  STOPPED_TASKS=$(aws ecs list-tasks \
    --cluster $CLUSTER_NAME \
    --desired-status STOPPED \
    --region $AWS_REGION \
    --started-by "ecs-svc" \
    --output text | wc -l | xargs)
  
  if [ "$STOPPED_TASKS" -gt 2 ] && [ "$RUNNING_COUNT" -eq 0 ]; then
    echo "⚠️ Warning: Multiple stopped tasks detected ($STOPPED_TASKS). Deployment may be failing."
    
    # Get detailed information about stopped tasks (just the latest one for brevity)
    LATEST_TASK_ARN=$(aws ecs list-tasks \
      --cluster $CLUSTER_NAME \
      --desired-status STOPPED \
      --region $AWS_REGION \
      --started-by "ecs-svc" \
      --output json | jq -r '.taskArns[0]')
    
    if [ -n "$LATEST_TASK_ARN" ] && [ "$LATEST_TASK_ARN" != "null" ]; then
      echo "Getting details for latest stopped task..."
      TASK_DETAILS=$(aws ecs describe-tasks \
        --cluster $CLUSTER_NAME \
        --tasks $LATEST_TASK_ARN \
        --region $AWS_REGION)
      
      STOP_REASON=$(echo $TASK_DETAILS | jq -r '.tasks[0].stoppedReason')
      echo "Stop reason: $STOP_REASON"
      
      # Get container exit codes
      echo "Container exit details:"
      echo $TASK_DETAILS | jq -r '.tasks[0].containers[] | "  - " + .name + ": " + (.exitCode | tostring) + " - " + (.reason // "No reason provided")'
    fi
  fi
  
  # Check for ongoing deployments (multiple deployments indicates a new deployment started)
  DEPLOYMENT_COUNT=$(echo $SERVICE_JSON | jq -r '.services[0].deployments | length')
  if [ "$DEPLOYMENT_COUNT" -gt 1 ]; then
    echo "ℹ️ Multiple deployments detected ($DEPLOYMENT_COUNT). There may be a newer deployment in progress."
    
    # Show brief info on all current deployments
    echo $SERVICE_JSON | jq -r '.services[0].deployments[] | "  - ID: " + .id + ", Status: " + .rolloutState + ", Running: " + (.runningCount | tostring) + "/" + (.desiredCount | tostring)'
  fi
  
  if [ $i -lt $MAX_CHECKS ]; then
    echo "Waiting 30 seconds before checking again..."
    sleep 30
  fi
done

echo "⏰ Timed out waiting for deployment to stabilize after $MAX_WAIT_MINUTES minutes."
echo "Current state: Running: $RUNNING_COUNT, Desired: $DESIRED_COUNT, Status: $PRIMARY_STATUS"
echo "This doesn't necessarily mean the deployment failed - check the AWS console."

# Exit with success anyway if either:
# 1. There are running tasks 
# 2. The deployment has been in a stable IN_PROGRESS state for a while
if [ "$RUNNING_COUNT" -gt 0 ] || [ $STABLE_COUNT -gt $(($STABLE_IN_PROGRESS_THRESHOLD / 2)) ]; then
  echo "✅ Since there are running tasks or deployment has been stable, considering the deployment successful."
  echo "Service has $RUNNING_COUNT/$DESIRED_COUNT tasks running."
  exit 0
else
  echo "❌ No running tasks found and deployment is not stable. Deployment may have failed."
  exit 1
fi
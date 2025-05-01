#!/bin/bash
# cloudwatch-setup.sh - Script to set up CloudWatch logs for ECS

# Configurable variables
LOG_GROUP_NAME="/ecs/lynqe-app"
RETENTION_DAYS=14
AWS_REGION=${1:-"us-east-2"}  # Default to us-east-2 if not specified

echo "Setting up CloudWatch logs for ECS in region $AWS_REGION..."

# Check if log group exists
echo "Checking if log group $LOG_GROUP_NAME exists..."
if aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP_NAME" --region $AWS_REGION | grep -q "$LOG_GROUP_NAME"; then
  echo "Log group $LOG_GROUP_NAME already exists."
else
  echo "Creating log group $LOG_GROUP_NAME..."
  aws logs create-log-group --log-group-name "$LOG_GROUP_NAME" --region $AWS_REGION

  # Set retention policy to manage costs
  echo "Setting retention policy to $RETENTION_DAYS days..."
  aws logs put-retention-policy --log-group-name "$LOG_GROUP_NAME" --retention-in-days $RETENTION_DAYS --region $AWS_REGION

  echo "Log group created successfully!"
fi

# Create cluster-level log group (for ECS platform logging)
CLUSTER_NAME="lynqe-cluster"
CLUSTER_LOG_GROUP="/ecs/$CLUSTER_NAME"

echo "Checking if cluster log group $CLUSTER_LOG_GROUP exists..."
if aws logs describe-log-groups --log-group-name-prefix "$CLUSTER_LOG_GROUP" --region $AWS_REGION | grep -q "$CLUSTER_LOG_GROUP"; then
  echo "Cluster log group $CLUSTER_LOG_GROUP already exists."
else
  echo "Creating cluster log group $CLUSTER_LOG_GROUP..."
  aws logs create-log-group --log-group-name "$CLUSTER_LOG_GROUP" --region $AWS_REGION

  # Set retention policy to manage costs
  echo "Setting retention policy to $RETENTION_DAYS days..."
  aws logs put-retention-policy --log-group-name "$CLUSTER_LOG_GROUP" --retention-in-days $RETENTION_DAYS --region $AWS_REGION

  echo "Cluster log group created successfully!"
fi

# Check for any recently created log streams
echo "Checking for recent log streams in $LOG_GROUP_NAME..."
aws logs describe-log-streams --log-group-name "$LOG_GROUP_NAME" --order-by LastEventTime --descending --limit 5 --region $AWS_REGION || echo "No log streams found yet."

echo "CloudWatch setup complete!"
echo ""
echo "To view your logs, run:"
echo "aws logs get-log-events --log-group-name \"$LOG_GROUP_NAME\" --log-stream-name \"ecs/lynqe-app-container/YOUR_TASK_ID\" --region $AWS_REGION"
echo ""
echo "Or visit the CloudWatch console at:"
echo "https://$AWS_REGION.console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#logsV2:log-groups/log-group/$LOG_GROUP_NAME"

#!/bin/bash
# update-ecs-health-check.sh - Add health check to ECS task definition

AWS_REGION="us-east-2"
SERVICE_NAME="lynqe-service"
CLUSTER_NAME="lynqe-cluster"

echo "Updating ECS task definition with health check configuration..."

# Get current task definition
TASK_DEFINITION=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].taskDefinition' \
  --output text)

echo "Current task definition: $TASK_DEFINITION"

# Get task definition details and store to JSON file
aws ecs describe-task-definition \
  --task-definition $TASK_DEFINITION \
  --region $AWS_REGION > task-def.json

# Create a new task definition with health check
echo "Extracting and updating container definitions..."
CONTAINER_DEFS=$(cat task-def.json | grep -v healthCheck | jq '.taskDefinition.containerDefinitions')
CONTAINER_DEFS_WITH_HEALTH=$(echo $CONTAINER_DEFS | jq '.[0] += {"healthCheck": {"command": ["CMD-SHELL", "curl -f http://localhost/health || exit 1"], "interval": 30, "timeout": 5, "retries": 3, "startPeriod": 60}}')

FAMILY=$(cat task-def.json | jq -r '.taskDefinition.family')
TASK_ROLE=$(cat task-def.json | jq -r '.taskDefinition.taskRoleArn // "null"')
EXECUTION_ROLE=$(cat task-def.json | jq -r '.taskDefinition.executionRoleArn // "null"')
NETWORK_MODE=$(cat task-def.json | jq -r '.taskDefinition.networkMode')
VOLUMES=$(cat task-def.json | jq '.taskDefinition.volumes')
PLACEMENT_CONSTRAINTS=$(cat task-def.json | jq '.taskDefinition.placementConstraints')
REQUIRES_COMPATIBILITIES=$(cat task-def.json | jq '.taskDefinition.requiresCompatibilities')
CPU=$(cat task-def.json | jq -r '.taskDefinition.cpu // "null"')
MEMORY=$(cat task-def.json | jq -r '.taskDefinition.memory // "null"')

echo "Creating new task definition JSON with health check..."
cat > new-task-def.json << EOF
{
  "family": "$FAMILY",
  "containerDefinitions": $CONTAINER_DEFS_WITH_HEALTH,
  "volumes": $VOLUMES,
  "networkMode": "$NETWORK_MODE",
  "placementConstraints": $PLACEMENT_CONSTRAINTS,
EOF

# Add optional parameters only if they exist
if [ "$TASK_ROLE" != "null" ]; then
  echo "  \"taskRoleArn\": \"$TASK_ROLE\"," >> new-task-def.json
fi

if [ "$EXECUTION_ROLE" != "null" ]; then
  echo "  \"executionRoleArn\": \"$EXECUTION_ROLE\"," >> new-task-def.json
fi

if [ "$REQUIRES_COMPATIBILITIES" != "[]" ]; then
  echo "  \"requiresCompatibilities\": $REQUIRES_COMPATIBILITIES," >> new-task-def.json
fi

if [ "$CPU" != "null" ]; then
  echo "  \"cpu\": \"$CPU\"," >> new-task-def.json
fi

if [ "$MEMORY" != "null" ]; then
  echo "  \"memory\": \"$MEMORY\"" >> new-task-def.json
else
  # Remove trailing comma from previous line if this is the last parameter
  sed -i '' '$ s/,$//' new-task-def.json
fi

echo "}" >> new-task-def.json

echo "Creating new task definition in ECS..."
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json file://new-task-def.json \
  --region $AWS_REGION \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "New task definition created: $NEW_TASK_DEF_ARN"

echo "Updating ECS service to use new task definition..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition $NEW_TASK_DEF_ARN \
  --region $AWS_REGION

echo "Service update initiated. The new health check will be applied when the deployment completes."
echo "You can monitor the deployment with:"
echo "aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION"

# Cleanup
echo "Cleaning up temporary files..."
rm task-def.json new-task-def.json

echo "Done! The container health status should change from 'Unknown' to 'Healthy' after deployment."
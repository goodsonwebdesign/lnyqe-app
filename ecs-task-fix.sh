#!/bin/bash
# Script to diagnose and fix task definition issues

set -e

# Configuration
AWS_REGION="us-east-2"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"
TASK_FAMILY="lynqe-app"  # Default task family, will be updated if found in service

echo "=== ECS Task Definition Diagnostic Tool ==="
echo "Region: $AWS_REGION"
echo "Cluster: $CLUSTER_NAME"
echo "Service: $SERVICE_NAME"
echo ""

# Get service details including task definition ARN
echo "1. Checking service configuration..."
SERVICE_INFO=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION --output json)

# Check if service exists
SERVICE_COUNT=$(echo "$SERVICE_INFO" | jq -r '.services | length')
if [ "$SERVICE_COUNT" -eq 0 ]; then
    echo "ERROR: Service $SERVICE_NAME not found in cluster $CLUSTER_NAME"
    exit 1
fi

# Extract task definition ARN from service
TASK_DEFINITION=$(echo "$SERVICE_INFO" | jq -r '.services[0].taskDefinition')
echo "Current task definition ARN from service: $TASK_DEFINITION"

# Check if task definition is None/null
if [ "$TASK_DEFINITION" == "null" ] || [ "$TASK_DEFINITION" == "None" ]; then
    echo "WARNING: Service does not have an associated task definition."
    
    # Try to extract task family from service name
    echo "2. Attempting to find task definition family..."
    
    # List all task definition families
    echo "Available task definition families:"
    aws ecs list-task-definition-families --region $AWS_REGION | jq -r '.families[]'
    
    echo ""
    echo "3. Looking for latest task definition with family: $TASK_FAMILY"
    
    # List the latest task definitions for the specified family
    LATEST_TASK_DEFS=$(aws ecs list-task-definitions --family-prefix $TASK_FAMILY --sort DESC --max-items 5 --region $AWS_REGION)
    LATEST_COUNT=$(echo "$LATEST_TASK_DEFS" | jq -r '.taskDefinitionArns | length')
    
    if [ "$LATEST_COUNT" -eq 0 ]; then
        echo "ERROR: No task definitions found for family $TASK_FAMILY"
        exit 1
    fi
    
    echo "Found task definitions:"
    echo "$LATEST_TASK_DEFS" | jq -r '.taskDefinitionArns[]'
    
    # Get the most recent task definition
    LATEST_TASK_DEF=$(echo "$LATEST_TASK_DEFS" | jq -r '.taskDefinitionArns[0]')
    echo ""
    echo "Latest task definition: $LATEST_TASK_DEF"
    
    # Get task definition details
    echo "4. Retrieving details for latest task definition..."
    TASK_DEF_JSON=$(aws ecs describe-task-definition --task-definition $LATEST_TASK_DEF --query "taskDefinition" --output json --region $AWS_REGION)
    
    # Extract container name and image
    CONTAINER_NAME=$(echo "$TASK_DEF_JSON" | jq -r '.containerDefinitions[0].name')
    CONTAINER_IMAGE=$(echo "$TASK_DEF_JSON" | jq -r '.containerDefinitions[0].image')
    
    echo "Container name: $CONTAINER_NAME"
    echo "Container image: $CONTAINER_IMAGE"
    
    echo ""
    echo "5. Checking if service needs to be updated with this task definition..."
    
    # Compare service status with the latest task definition
    echo "Current service status:"
    echo "$SERVICE_INFO" | jq -r '.services[0].status'
    
    echo ""
    echo "Deployments:"
    echo "$SERVICE_INFO" | jq -r '.services[0].deployments[] | {id: .id, status: .status, desiredCount: .desiredCount, pendingCount: .pendingCount, runningCount: .runningCount}'
    
    echo ""
    echo "RECOMMENDATION: Update service with task definition: $LATEST_TASK_DEF"
    echo "Command to update service:"
    echo "aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition $LATEST_TASK_DEF --force-new-deployment --region $AWS_REGION"
else
    echo "2. Retrieving details for current task definition..."
    # Get task definition details
    TASK_DEF_JSON=$(aws ecs describe-task-definition --task-definition $TASK_DEFINITION --query "taskDefinition" --output json --region $AWS_REGION)
    
    # Extract family, container name and image
    TASK_FAMILY=$(echo "$TASK_DEF_JSON" | jq -r '.family')
    CONTAINER_NAME=$(echo "$TASK_DEF_JSON" | jq -r '.containerDefinitions[0].name')
    CONTAINER_IMAGE=$(echo "$TASK_DEF_JSON" | jq -r '.containerDefinitions[0].image')
    
    echo "Task family: $TASK_FAMILY"
    echo "Container name: $CONTAINER_NAME"
    echo "Container image: $CONTAINER_IMAGE"
    
    echo ""
    echo "3. Service deployment status:"
    echo "$SERVICE_INFO" | jq -r '.services[0].status'
    
    echo ""
    echo "Deployments:"
    echo "$SERVICE_INFO" | jq -r '.services[0].deployments[] | {id: .id, status: .status, desiredCount: .desiredCount, pendingCount: .pendingCount, runningCount: .runningCount}'
fi

echo ""
echo "6. Load balancer configuration:"
echo "$SERVICE_INFO" | jq -r '.services[0].loadBalancers'

echo ""
echo "=== Diagnostic Complete ==="

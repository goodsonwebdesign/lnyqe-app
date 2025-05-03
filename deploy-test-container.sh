#!/bin/bash
# deploy-test-container.sh - Deploy a simplified test container to diagnose ECS issues

set -e

# Configuration
ECR_REPOSITORY="lynqe-app"
AWS_REGION="us-east-2"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"
TASK_FAMILY="lynqe-app"
CONTAINER_NAME="lynqe-app-container"

# Step 1: Get AWS account ID
echo "Retrieving AWS account ID..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"

# Step 2: Authenticate Docker with ECR
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Step 3: Build test Docker image
echo "Building test Docker image..."
TIMESTAMP=$(date +%Y%m%d%H%M%S)
IMAGE_TAG="test-${TIMESTAMP}"
echo "Using image tag: ${IMAGE_TAG}"

# Build test image
docker build -t ${ECR_REPOSITORY}:${IMAGE_TAG} -f Dockerfile.test .

# Step 4: Tag and push the test image
echo "Tagging and pushing test image to ECR..."
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REPOSITORY_URI}:${IMAGE_TAG}
docker push ${ECR_REPOSITORY_URI}:${IMAGE_TAG}

# Step 5: Update the ECS task definition with the test image
echo "Updating ECS task definition..."
TASK_DEFINITION=$(aws ecs describe-task-definition --task-definition $TASK_FAMILY --query "taskDefinition" --output json --region $AWS_REGION)
NEW_TASK_DEFINITION=$(echo $TASK_DEFINITION | jq --arg IMAGE "${ECR_REPOSITORY_URI}:${IMAGE_TAG}" \
    '.containerDefinitions[0].image = $IMAGE | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.compatibilities) | del(.registeredAt) | del(.registeredBy)')

# Step 6: Register the new task definition
echo "Registering new task definition..."
NEW_TASK_ARN=$(aws ecs register-task-definition --cli-input-json "$NEW_TASK_DEFINITION" --query "taskDefinition.taskDefinitionArn" --output text --region $AWS_REGION)
echo "New task definition: $NEW_TASK_ARN"

# Step 7: Update the service with force-new-deployment flag
echo "Updating ECS service with new task definition and forcing new deployment..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition $NEW_TASK_ARN \
  --force-new-deployment \
  --region $AWS_REGION

echo "Test container deployment initiated."
echo "Run the following command to check service status:"
echo "aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION"
echo ""
echo "Once the task is running, you can access the test page through your ALB."
echo "This test will help determine if your deployment issues are related to Auth0 HTTPS requirements."

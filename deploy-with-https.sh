#!/bin/bash
# deploy-with-https.sh - Script to deploy the application with HTTPS support for Auth0

set -e

# Configuration
AWS_REGION="us-east-2"
ECR_REPO="lynqe-app"
ECR_ACCOUNT="872515255646.dkr.ecr.us-east-2.amazonaws.com"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"

# Step 0: Build the Angular application first
echo "Building Angular application..."
npm run build

# Step 1: Build and tag the Docker image with a timestamp
TIMESTAMP=$(date +%Y%m%d%H%M%S)
IMAGE_TAG="https-${TIMESTAMP}"

echo "Building Docker image with tag: $IMAGE_TAG"
docker build -t ${ECR_ACCOUNT}/${ECR_REPO}:${IMAGE_TAG} -f Dockerfile.prod .

# Step 2: Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_ACCOUNT}

# Step 3: Push the image to ECR
echo "Pushing image to ECR..."
docker push ${ECR_ACCOUNT}/${ECR_REPO}:${IMAGE_TAG}

echo "Image pushed to ECR: ${ECR_ACCOUNT}/${ECR_REPO}:${IMAGE_TAG}"

# Step 4: Update the task definition with the new image
echo "Updating task definition with new image..."
TASK_DEF=$(aws ecs describe-task-definition --task-definition lynqe-app --region ${AWS_REGION})
NEW_TASK_DEF=$(echo $TASK_DEF | jq -r '.taskDefinition' | jq '.containerDefinitions[0].image="'${ECR_ACCOUNT}/${ECR_REPO}:${IMAGE_TAG}'"')
NEW_TASK_DEF_FAMILY=$(echo $TASK_DEF | jq -r '.taskDefinition.family')

# Step 5: Register the new task definition
echo "Registering new task definition..."
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --region ${AWS_REGION} \
  --family ${NEW_TASK_DEF_FAMILY} \
  --execution-role-arn $(echo $TASK_DEF | jq -r '.taskDefinition.executionRoleArn') \
  --network-mode $(echo $TASK_DEF | jq -r '.taskDefinition.networkMode') \
  --container-definitions "$(echo $NEW_TASK_DEF | jq -r '.containerDefinitions')" \
  --requires-compatibilities $(echo $TASK_DEF | jq -r '.taskDefinition.requiresCompatibilities[]') \
  --cpu $(echo $TASK_DEF | jq -r '.taskDefinition.cpu') \
  --memory $(echo $TASK_DEF | jq -r '.taskDefinition.memory') \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "New task definition registered: $NEW_TASK_DEF_ARN"

# Step 6: Update the service with the new task definition and force a new deployment
echo "Updating ECS service with new task definition and forcing new deployment..."
aws ecs update-service \
  --cluster ${CLUSTER_NAME} \
  --service ${SERVICE_NAME} \
  --task-definition ${NEW_TASK_DEF_ARN} \
  --force-new-deployment \
  --region ${AWS_REGION}

echo "ECS service update initiated. This may take a few minutes to complete."
echo "You can check the status with:"
echo "aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} --region ${AWS_REGION}"

echo "Your application should now be deploying with HTTPS support for Auth0."
echo "Once the deployment is complete, your application will be accessible at https://lynqe.io"
#!/bin/bash
# deploy.sh - Script to build, push and deploy the lynqe-app to ECS

set -e

# Configuration
ECR_REPOSITORY="lynqe-app"
AWS_REGION="us-east-2"  # Updated to the correct region
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

# Step 3: Build Docker image
echo "Building Docker image..."
COMMIT_HASH=$(git rev-parse --short HEAD)
IMAGE_TAG="${COMMIT_HASH}-$(date +%Y%m%d%H%M%S)"  # Added timestamp for uniqueness
docker build -t ${ECR_REPOSITORY}:${IMAGE_TAG} -f Dockerfile.prod .

# Step 4: Tag and push the image
echo "Tagging and pushing image to ECR..."
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REPOSITORY_URI}:${IMAGE_TAG}
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REPOSITORY_URI}:latest
docker push ${ECR_REPOSITORY_URI}:${IMAGE_TAG}
docker push ${ECR_REPOSITORY_URI}:latest

# Step 5: Update the ECS task definition
echo "Updating ECS task definition..."
TASK_DEFINITION=$(aws ecs describe-task-definition --task-definition $TASK_FAMILY --query "taskDefinition" --output json --region $AWS_REGION)
NEW_TASK_DEFINITION=$(echo $TASK_DEFINITION | jq --arg IMAGE "${ECR_REPOSITORY_URI}:${IMAGE_TAG}" \
    '.containerDefinitions[0].image = $IMAGE | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.compatibilities) | del(.registeredAt) | del(.registeredBy)')

# Step 6: Register the new task definition
echo "Registering new task definition..."
NEW_TASK_ARN=$(aws ecs register-task-definition --cli-input-json "$NEW_TASK_DEFINITION" --query "taskDefinition.taskDefinitionArn" --output text --region $AWS_REGION)

# Step 7: Ensure CloudWatch Log Groups exist
echo "Ensuring CloudWatch Log Groups exist..."
aws logs create-log-group --log-group-name "/ecs/lynqe-app" --region $AWS_REGION || true

# Step 8: Get current ECS service configuration
echo "Retrieving current ECS service configuration..."
SERVICE_INFO=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION)

# Extract subnet IDs directly from the current service
SUBNETS=$(echo $SERVICE_INFO | jq -r '.services[0].networkConfiguration.awsvpcConfiguration.subnets[]' | tr '\n' ',' | sed 's/,$//')
SUBNET_ARR=$(echo $SERVICE_INFO | jq '.services[0].networkConfiguration.awsvpcConfiguration.subnets')
SECURITY_GROUPS=$(echo $SERVICE_INFO | jq '.services[0].networkConfiguration.awsvpcConfiguration.securityGroups')

echo "Using subnets: $SUBNETS"
echo "Using security groups: $SECURITY_GROUPS"

# Step 9: Check for existing load balancer configuration
echo "Checking for existing load balancer configuration..."
LB_CONFIG=$(echo $SERVICE_INFO | jq '.services[0].loadBalancers')

# Step 10: Update the service
echo "Updating ECS service with new task definition..."
max_attempts=3
attempt=1
while [ $attempt -le $max_attempts ]; do
  echo "Attempt $attempt of $max_attempts to update ECS service..."

  # If the service has a load balancer configuration, include it in the update
  if [ -n "$LB_CONFIG" ] && [ "$LB_CONFIG" != "null" ] && [ "$LB_CONFIG" != "[]" ]; then
    echo "Updating service with load balancer configuration..."
    TARGET_GROUP_ARN=$(echo $LB_CONFIG | jq -r '.[0].targetGroupArn')

    update_result=$(aws ecs update-service \
      --cluster $CLUSTER_NAME \
      --service $SERVICE_NAME \
      --task-definition $NEW_TASK_ARN \
      --network-configuration "awsvpcConfiguration={subnets=$SUBNET_ARR,securityGroups=$SECURITY_GROUPS,assignPublicIp=ENABLED}" \
      --load-balancers "targetGroupArn=$TARGET_GROUP_ARN,containerName=$CONTAINER_NAME,containerPort=80" \
      --desired-count 1 \
      --region $AWS_REGION 2>&1)
  else
    echo "Updating service without load balancer configuration..."
    update_result=$(aws ecs update-service \
      --cluster $CLUSTER_NAME \
      --service $SERVICE_NAME \
      --task-definition $NEW_TASK_ARN \
      --network-configuration "awsvpcConfiguration={subnets=$SUBNET_ARR,securityGroups=$SECURITY_GROUPS,assignPublicIp=ENABLED}" \
      --desired-count 1 \
      --region $AWS_REGION 2>&1)
  fi

  if [ $? -eq 0 ]; then
    echo "ECS service update initiated successfully!"
    break
  else
    echo "Error updating service: $update_result"
    if [ $attempt -lt $max_attempts ]; then
      echo "Waiting 5 seconds before retrying..."
      sleep 5
    fi
    ((attempt++))
  fi
done

# Step 11: Wait for service to stabilize
echo "Waiting for ECS service to stabilize (timeout after 15 minutes)..."
timeout=900  # 15 minutes in seconds
start_time=$(date +%s)
end_time=$((start_time + timeout))
stabilized=false

check_count=1
max_checks=30

while [ $check_count -le $max_checks ] && [ "$(date +%s)" -lt $end_time ]; do
  echo "Check $check_count of $max_checks: Verifying service stability..."

  service_info=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION)
  deployment_status=$(echo $service_info | jq -r '.services[0].deployments[0].rolloutState')
  running_count=$(echo $service_info | jq -r '.services[0].runningCount')
  desired_count=$(echo $service_info | jq -r '.services[0].desiredCount')

  echo "Deployment status: $deployment_status, Running: $running_count, Desired: $desired_count"

  recent_events=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --query 'services[0].events[0:3].message' --output text --region $AWS_REGION)
  echo "Recent events:"
  echo "$recent_events"

  if [[ "$deployment_status" == "COMPLETED" || "$deployment_status" == "null" ]] && [ "$running_count" -eq "$desired_count" ] && [ "$desired_count" -gt 0 ]; then
    echo "Service has stabilized successfully!"
    stabilized=true
    break
  fi

  echo "Waiting 30 seconds before checking again..."
  sleep 30
  ((check_count++))
done

if [ "$stabilized" = true ]; then
  echo "Deployment completed successfully!"

  # Check the ALB DNS name
  ALB_ARN=$(aws elbv2 describe-load-balancers --query "LoadBalancers[?contains(DNSName, 'lynqe')].LoadBalancerArn" --output text --region $AWS_REGION)
  if [ -n "$ALB_ARN" ]; then
    ALB_DNS=$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query "LoadBalancers[0].DNSName" --output text --region $AWS_REGION)
    echo "The new application should be accessible at: http://$ALB_DNS"
  else
    echo "The new application should be accessible through your load balancer."
  fi
else
  echo "Warning: Service did not stabilize within the timeout period."
  echo "Please check the AWS ECS console or run troubleshooting commands."
fi

echo "Deployment process completed."

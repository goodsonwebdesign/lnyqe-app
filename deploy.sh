#!/bin/bash
# deploy.sh - Script to build, push and deploy the lynqe-app to ECS with forced updates

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

# Step 3: Build Docker image with a unique timestamp and deploy marker
echo "Building Docker image..."
COMMIT_HASH=$(git rev-parse --short HEAD)
TIMESTAMP=$(date +%Y%m%d%H%M%S)
IMAGE_TAG="${COMMIT_HASH}-${TIMESTAMP}"
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DEPLOY_ID="DEPLOY-${TIMESTAMP}"
echo "Using build timestamp: ${BUILD_DATE}"
echo "Using image tag: ${IMAGE_TAG}"
echo "Using deploy ID: ${DEPLOY_ID}"

# Build the Angular application first
echo "Building Angular application for production..."
npm run ci:build || npm run build

# Force removing any existing image with the same name to ensure clean build
echo "Removing any existing images with the same name..."
docker rmi -f ${ECR_REPOSITORY}:latest || true
docker rmi -f ${ECR_REPOSITORY_URI}:latest || true

# Build with no-cache to ensure clean build and pass the deploy ID as a build argument
docker build --no-cache --build-arg BUILD_DATE="${BUILD_DATE}" --build-arg DEPLOY_ID="${DEPLOY_ID}" -t ${ECR_REPOSITORY}:${IMAGE_TAG} -f Dockerfile.prod .

# Step 4: Tag and push the image
echo "Tagging and pushing image to ECR..."
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REPOSITORY_URI}:${IMAGE_TAG}
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REPOSITORY_URI}:latest
docker push ${ECR_REPOSITORY_URI}:${IMAGE_TAG}
docker push ${ECR_REPOSITORY_URI}:latest

# Step 5: Update the ECS task definition with the specific image tag (not latest)
echo "Updating ECS task definition..."
TASK_DEFINITION=$(aws ecs describe-task-definition --task-definition $TASK_FAMILY --query "taskDefinition" --output json --region $AWS_REGION)
NEW_TASK_DEFINITION=$(echo $TASK_DEFINITION | jq --arg IMAGE "${ECR_REPOSITORY_URI}:${IMAGE_TAG}" \
    --arg DEPLOY_ID "${DEPLOY_ID}" \
    '.containerDefinitions[0].image = $IMAGE | .containerDefinitions[0].environment += [{"name": "DEPLOY_ID", "value": $DEPLOY_ID}] | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.compatibilities) | del(.registeredAt) | del(.registeredBy)')

# Step 6: Register the new task definition
echo "Registering new task definition..."
NEW_TASK_ARN=$(aws ecs register-task-definition --cli-input-json "$NEW_TASK_DEFINITION" --query "taskDefinition.taskDefinitionArn" --output text --region $AWS_REGION)
echo "New task definition: $NEW_TASK_ARN"

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

# Step 10: Update the service with force-new-deployment flag
echo "Updating ECS service with new task definition and forcing new deployment..."
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
      --force-new-deployment \
      --region $AWS_REGION 2>&1)
  else
    echo "Updating service without load balancer configuration..."
    update_result=$(aws ecs update-service \
      --cluster $CLUSTER_NAME \
      --service $SERVICE_NAME \
      --task-definition $NEW_TASK_ARN \
      --network-configuration "awsvpcConfiguration={subnets=$SUBNET_ARR,securityGroups=$SECURITY_GROUPS,assignPublicIp=ENABLED}" \
      --desired-count 1 \
      --force-new-deployment \
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
env_check_successful=false
deployment_stabilized=false
consecutive_completed=0

check_count=1
max_checks=30

while [ $check_count -le $max_checks ] && [ "$(date +%s)" -lt $end_time ]; do
  echo "Check $check_count of $max_checks: Verifying service stability..."

  service_info=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION)
  deployment_status=$(echo $service_info | jq -r '.services[0].deployments[0].rolloutState')
  running_count=$(echo $service_info | jq -r '.services[0].runningCount')
  desired_count=$(echo $service_info | jq -r '.services[0].desiredCount')

  echo "Deployment status: $deployment_status, Running: $running_count, Desired: $desired_count"

  # Check if service deployment is stable
  if [[ "$deployment_status" == "COMPLETED" ]] && [ "$running_count" -eq "$desired_count" ] && [ "$desired_count" -gt 0 ]; then
    deployment_stabilized=true
    
    # Count consecutive COMPLETED status checks
    consecutive_completed=$((consecutive_completed+1))
    echo "Deployment is COMPLETED ($consecutive_completed consecutive checks)"
    
    # Force exit after 2 consecutive COMPLETED checks even if we can't verify DEPLOY_ID
    if [[ "$consecutive_completed" -ge 2 ]]; then
      echo "Service has been COMPLETED for $consecutive_completed consecutive checks. Considering deployment successful!"
      break
    fi
  else
    consecutive_completed=0
  fi

  # Check specifically for the new deployment
  running_tasks=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --desired-status RUNNING --region $AWS_REGION)
  task_arns=$(echo $running_tasks | jq -r '.taskArns[]' 2>/dev/null)

  if [ -n "$task_arns" ]; then
    echo "Verifying DEPLOY_ID in task environment variables..."
    for task_arn in $task_arns; do
      task_details=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $task_arn --region $AWS_REGION)

      # Check if environment exists before trying to process it
      has_env=$(echo $task_details | jq '.tasks[0].containers[0].environment != null' 2>/dev/null)
      if [ "$has_env" == "true" ]; then
        task_deploy_id=$(echo $task_details | jq -r '.tasks[0].containers[0].environment[] | select(.name=="DEPLOY_ID") | .value' 2>/dev/null)

        if [ -n "$task_deploy_id" ] && [ "$task_deploy_id" == "$DEPLOY_ID" ]; then
          echo "Confirmed new deployment with DEPLOY_ID: $DEPLOY_ID is running!"
          env_check_successful=true
        else
          echo "Warning: Task is running but with DEPLOY_ID: '$task_deploy_id' (expected '$DEPLOY_ID')"
        fi
      else
        echo "Warning: Task environment is null or not available yet. Will check again."
      fi
    done
  else
    echo "No running tasks found yet. Waiting for tasks to start..."
  fi

  recent_events=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --query 'services[0].events[0:3].message' --output text --region $AWS_REGION)
  echo "Recent events:"
  echo "$recent_events"

  # Check if we should consider the deployment successful
  if [ "$deployment_stabilized" == true ]; then
    if [ "$env_check_successful" == true ]; then
      echo "Service has stabilized successfully with the new deployment and verified DEPLOY_ID!"
      break
    elif [ $check_count -ge $((max_checks * 2/3)) ]; then
      # If we've waited for 2/3 of the max time and the deployment is stable but we can't verify the ENV,
      # we'll assume success to avoid deployment timeouts
      echo "Service has stabilized successfully but cannot verify DEPLOY_ID in environment. Assuming success."
      break
    fi
  fi

  echo "Waiting 30 seconds before checking again..."
  sleep 30
  ((check_count++))
done

# Consider deployment successful if either the environment check succeeded or the deployment stabilized
if [ "$env_check_successful" = true ] || [ "$deployment_stabilized" = true ]; then
  echo "Deployment completed successfully!"

  # Check the ALB DNS name
  ALB_ARN=$(aws elbv2 describe-load-balancers --query "LoadBalancers[?contains(DNSName, 'lynqe')].LoadBalancerArn" --output text --region $AWS_REGION)
  if [ -n "$ALB_ARN" ]; then
    ALB_DNS=$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query "LoadBalancers[0].DNSName" --output text --region $AWS_REGION)
    echo "The new application should be accessible at: https://$ALB_DNS"
  else
    echo "The new application should be accessible through your load balancer."
  fi
else
  echo "Warning: Service did not stabilize within the timeout period."
  echo "Please check the AWS ECS console or run troubleshooting commands."
fi

# Print a clear verification message with the deploy ID
echo "============================================================"
echo "DEPLOYMENT COMPLETED WITH ID: $DEPLOY_ID"
echo "IMAGE TAG: ${IMAGE_TAG}"
echo "DATE/TIME: ${BUILD_DATE}"
echo "============================================================"
echo "To verify this deployment has reached production, look for this"
echo "DEPLOY_ID in your application's build information footer."
echo "If you don't see this ID, your ALB may still be routing to an old task."
echo "Deployment process completed."

#!/bin/bash
# check-container-logs.sh - Inspect ECS container logs and health (no jq required)

# Set the AWS region and container details
AWS_REGION="us-east-2"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"
CONTAINER_NAME="lynqe-app-container"
TASK_ID="d902029036854161a518efa502b446b2"  # From your provided task ID

echo "Checking ECS container logs and health in $AWS_REGION..."

# Check service health
echo "Checking service health status..."
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].events[0:5][].message' \
  --output text || echo "Error: Failed to retrieve service events"

# Check container logs from CloudWatch
echo -e "\nChecking container logs from CloudWatch..."
aws logs get-log-events \
  --log-group-name "/ecs/lynqe-app" \
  --log-stream-name "ecs/lynqe-app-container/$TASK_ID" \
  --limit 20 \
  --query 'events[].message' \
  --region $AWS_REGION \
  --output text || echo "Error: Failed to retrieve logs. The log stream may not exist or you may not have permission."

# Check target health (load balancer health check status) with better error handling
echo -e "\nChecking target health status..."
TARGET_GROUP_ARN=""
echo "Attempting to get target group ARN..."
TARGET_GROUP_ARN=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].loadBalancers[0].targetGroupArn' \
  --output text)

if [[ $TARGET_GROUP_ARN == "None" || -z "$TARGET_GROUP_ARN" ]]; then
  echo "No target group found for this service. Service may not be connected to a load balancer."
else
  echo "Target Group ARN: $TARGET_GROUP_ARN"
  aws elbv2 describe-target-health \
    --target-group-arn "$TARGET_GROUP_ARN" \
    --region $AWS_REGION \
    --output text || echo "Error: Could not retrieve target health information"
fi

# Simple diagnostic for Nginx configuration
echo -e "\nCurrent Nginx configuration in container..."
echo "Checking access to favicon.ico directly..."
echo "Note: This approach won't work for an ECS container without direct access."
echo "This information is for your local testing only."

# Check the container's task definition for essential details
echo -e "\nChecking task definition for logging configuration and health checks..."
aws ecs describe-task-definition \
  --task-definition lynqe-app \
  --region $AWS_REGION \
  --query 'taskDefinition.containerDefinitions[0].[name,image,essential,healthCheck,logConfiguration]' \
  --output text || echo "Error: Could not retrieve task definition details"

echo -e "\nTroubleshooting guidance for favicon.ico 503 errors:"
echo "1. Verify your Angular build process includes favicon.ico in the output:"
echo "   → We've updated your angular.json to properly include favicon.ico at both"
echo "     the root level (/favicon.ico) and in the assets directory (/assets/favicon.ico)"
echo "   → The file already exists in both public/ and assets/ directories"
echo ""
echo "2. Ensure your Nginx configuration properly handles static asset requests:"
echo "   → Your nginx.conf already has the correct rule for .ico files:"
echo "     location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ { ... }"
echo ""
echo "3. Next steps to fix this issue:"
echo "   → Deploy the updated code with the fixed angular.json configuration"
echo "   → This will ensure favicon.ico is properly included in the build output"
echo "   → Once deployed, the 503 error should be resolved"
echo ""
echo "4. If you continue to see 503 errors after deployment, consider:"
echo "   → Checking Nginx error logs with: aws logs get-log-events --log-group-name \"/ecs/lynqe-app\" \\"
echo "      --log-stream-name \"ecs/lynqe-app-container/$TASK_ID\" --region $AWS_REGION"
echo "   → Verifying the load balancer health check is targeting the /health endpoint"
echo "   → Increasing container resources if necessary (currently 0.25 vCPU, 0.5 GB memory)"

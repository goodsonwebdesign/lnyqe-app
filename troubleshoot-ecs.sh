#!/bin/bash
# troubleshoot-ecs.sh - Simple ECS and favicon troubleshooting

AWS_REGION="us-east-2"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"

echo "=== ECS Deployment Status Check ==="
echo "Checking for ECS service status..."
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --query 'services[0].[serviceName,status,desiredCount,runningCount,pendingCount]' \
  --region $AWS_REGION \
  --output text

echo -e "\n=== Recent Service Events ==="
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --query 'services[0].events[0:3][].message' \
  --region $AWS_REGION \
  --output text

echo -e "\n=== Deployment Status ==="
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --query 'services[0].deployments[0].[status,rolloutState,desiredCount,runningCount,pendingCount]' \
  --region $AWS_REGION \
  --output text

echo -e "\n=== Solution for 503 Favicon.ico Errors ==="
echo "1. We've updated your angular.json configuration to properly include favicon.ico in the build:"
echo "   - Added favicon.ico to the assets array with output at both root (/) and assets folders"
echo "   - This ensures the file is available at both /favicon.ico and /assets/favicon.ico paths"
echo ""
echo "2. Your nginx.conf is already correctly configured to serve .ico files with:"
echo "   location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {"
echo "     expires 7d;"
echo "     add_header Cache-Control \"public, max-age=604800, immutable\";"
echo "   }"
echo ""
echo "3. Next steps:"
echo "   a. Commit and push these changes to your repository"
echo "   b. Your CI/CD pipeline will build and deploy the application with the fixed favicon"
echo "   c. The 503 errors for favicon.ico should be resolved after deployment"
echo ""
echo "4. If problems persist after deployment, check your CloudWatch logs with:"
echo "   aws logs get-log-events --log-group-name \"/ecs/lynqe-app\" \\"
echo "     --log-stream-name \"ecs/lynqe-app-container/YOUR_TASK_ID\" \\"
echo "     --region $AWS_REGION --output text"

#!/bin/bash
# get-alb-endpoint.sh - Find the ALB endpoint for your ECS service

AWS_REGION="us-east-2"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"

echo "Finding Application Load Balancer endpoint for your ECS service..."

# Get the target group ARN from your ECS service
TARGET_GROUP_ARN=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].loadBalancers[0].targetGroupArn' \
  --output text)

if [[ -z "$TARGET_GROUP_ARN" || "$TARGET_GROUP_ARN" == "None" ]]; then
  echo "Error: No target group found for this service."
  echo "Your ECS service may not be configured with a load balancer."
  exit 1
fi

echo "Target Group ARN: $TARGET_GROUP_ARN"

# Get the load balancer ARN from the target group
LOAD_BALANCER_ARN=$(aws elbv2 describe-target-groups \
  --target-group-arns $TARGET_GROUP_ARN \
  --region $AWS_REGION \
  --query 'TargetGroups[0].LoadBalancerArns[0]' \
  --output text)

if [[ -z "$LOAD_BALANCER_ARN" || "$LOAD_BALANCER_ARN" == "None" ]]; then
  echo "Error: No load balancer found attached to this target group."
  exit 1
fi

echo "Load Balancer ARN: $LOAD_BALANCER_ARN"

# Get the load balancer DNS name
LOAD_BALANCER_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $LOAD_BALANCER_ARN \
  --region $AWS_REGION \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

echo ""
echo "======================================"
echo "Your application should be accessible at:"
echo "http://$LOAD_BALANCER_DNS"
echo "======================================"
echo ""
echo "If you still cannot access your application, check:"
echo "1. The load balancer security groups allow inbound HTTP/HTTPS traffic"
echo "2. Your ECS task is passing health checks"
echo "3. Your application is properly listening on port 80"
echo ""
echo "To check target health status, run:"
echo "aws elbv2 describe-target-health --target-group-arn $TARGET_GROUP_ARN --region $AWS_REGION"

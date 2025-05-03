#!/bin/bash
# ecs-task-failure-analyzer.sh - Advanced script to diagnose ECS task failures with HTTPS focus

set -e

# Configuration
AWS_REGION="us-east-2"
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"
LOG_GROUP_NAME="/ecs/lynqe-app"

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BOLD}======================================================"
echo -e "🔍 ADVANCED ECS TASK FAILURE ANALYZER FOR HTTPS DEPLOYMENTS"
echo -e "======================================================${NC}"

# Function to print section headers
section() {
  echo -e "\n${BOLD}${YELLOW}$1${NC}"
  echo -e "${YELLOW}------------------------------${NC}"
}

# Function to print success messages
success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error messages
error() {
  echo -e "${RED}❌ $1${NC}"
}

# Function to print warning messages
warning() {
  echo -e "${YELLOW}⚠️ $1${NC}"
}

section "1. CURRENT SERVICE STATUS"
echo "Checking ECS service current state..."
SERVICE_JSON=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION)

# Extract key metrics
DESIRED_COUNT=$(echo $SERVICE_JSON | jq -r '.services[0].desiredCount')
RUNNING_COUNT=$(echo $SERVICE_JSON | jq -r '.services[0].runningCount')
PENDING_COUNT=$(echo $SERVICE_JSON | jq -r '.services[0].pendingCount')
TASK_DEF_ARN=$(echo $SERVICE_JSON | jq -r '.services[0].taskDefinition')

echo "Desired Tasks: $DESIRED_COUNT"
echo "Running Tasks: $RUNNING_COUNT"
echo "Pending Tasks: $PENDING_COUNT"
echo "Task Definition: $TASK_DEF_ARN"

# Check if deployment is in progress
DEPLOYMENTS=$(echo $SERVICE_JSON | jq -r '.services[0].deployments')
DEPLOYMENT_COUNT=$(echo $DEPLOYMENTS | jq 'length')

if [ $DEPLOYMENT_COUNT -gt 1 ]; then
  warning "Multiple deployments detected. This may indicate a rollback or deployment issue."
  echo "Deployment details:"
  echo $DEPLOYMENTS | jq -r '.[] | "  ID: \(.id) Status: \(.status) Desired: \(.desiredCount) Running: \(.runningCount)"'
fi

# Show recent events
section "2. RECENT SERVICE EVENTS"
echo $SERVICE_JSON | jq -r '.services[0].events[0:5][] | "[\(.createdAt|todate)] \(.message)"'

section "3. ANALYZING STOPPED TASKS"
echo "Finding recently stopped tasks..."

# Get the 5 most recent stopped tasks
STOPPED_TASKS=$(aws ecs list-tasks \
  --cluster $CLUSTER_NAME \
  --desired-status STOPPED \
  --region $AWS_REGION \
  --output json)

TASK_ARNS=$(echo $STOPPED_TASKS | jq -r '.taskArns[]')

if [ -z "$TASK_ARNS" ]; then
  warning "No stopped tasks found. Checking for active ones instead..."
  
  # Get running/pending tasks instead
  ACTIVE_TASKS=$(aws ecs list-tasks \
    --cluster $CLUSTER_NAME \
    --region $AWS_REGION \
    --output json)
    
  TASK_ARNS=$(echo $ACTIVE_TASKS | jq -r '.taskArns[]')
  
  if [ -z "$TASK_ARNS" ]; then
    error "No active tasks found either. Service may be unable to start any tasks."
  fi
else
  echo "Found stopped tasks. Analyzing failure reasons..."
  
  # Get details for each stopped task (limit to 3 most recent)
  COUNTER=0
  for TASK_ARN in $TASK_ARNS; do
    if [ $COUNTER -ge 3 ]; then
      break
    fi
    
    TASK_ID=$(echo $TASK_ARN | cut -d'/' -f3)
    echo -e "\n${BOLD}Task ID: $TASK_ID${NC}"
    
    TASK_DETAILS=$(aws ecs describe-tasks \
      --cluster $CLUSTER_NAME \
      --tasks $TASK_ARN \
      --region $AWS_REGION)
    
    # Get the stop reason
    STOP_REASON=$(echo $TASK_DETAILS | jq -r '.tasks[0].stoppedReason')
    echo "Stop reason: $STOP_REASON"
    
    # Get container exit codes
    CONTAINER_DETAILS=$(echo $TASK_DETAILS | jq -r '.tasks[0].containers[] | {name: .name, exitCode: .exitCode, reason: .reason}')
    echo "Container details:"
    echo "$CONTAINER_DETAILS"
    
    # Get task created and stopped times
    TASK_CREATED=$(echo $TASK_DETAILS | jq -r '.tasks[0].createdAt')
    TASK_STOPPED=$(echo $TASK_DETAILS | jq -r '.tasks[0].stoppedAt')
    
    if [ "$TASK_CREATED" != "null" ] && [ "$TASK_STOPPED" != "null" ]; then
      CREATED_TIME=$(date -d "$TASK_CREATED" "+%Y-%m-%d %H:%M:%S")
      STOPPED_TIME=$(date -d "$TASK_STOPPED" "+%Y-%m-%d %H:%M:%S")
      echo "Task lifetime: $CREATED_TIME to $STOPPED_TIME"
      
      # Calculate how long the task ran
      CREATED_SECONDS=$(date -d "$TASK_CREATED" "+%s")
      STOPPED_SECONDS=$(date -d "$TASK_STOPPED" "+%s")
      DURATION=$((STOPPED_SECONDS - CREATED_SECONDS))
      echo "Task ran for: $DURATION seconds"
      
      if [ $DURATION -lt 10 ]; then
        warning "Task stopped very quickly (< 10s). This often indicates a startup or configuration issue."
      fi
    fi
    
    # Check logs
    LOG_STREAMS=$(aws logs describe-log-streams \
      --log-group-name $LOG_GROUP_NAME \
      --log-stream-name-prefix "ecs/lynqe-app-container/$TASK_ID" \
      --region $AWS_REGION \
      --output json 2>/dev/null || echo '{"logStreams": []}')
    
    STREAM_NAME=$(echo $LOG_STREAMS | jq -r '.logStreams[0].logStreamName')
    
    if [ -n "$STREAM_NAME" ] && [ "$STREAM_NAME" != "null" ]; then
      echo -e "\n${BOLD}CloudWatch Logs:${NC}"
      aws logs get-log-events \
        --log-group-name $LOG_GROUP_NAME \
        --log-stream-name "$STREAM_NAME" \
        --limit 50 \
        --region $AWS_REGION | jq -r '.events[].message' | head -n 30
    else
      warning "No CloudWatch logs found for this task. The container may have failed before logging started."
    fi
    
    COUNTER=$((COUNTER + 1))
  done
fi

section "4. TASK DEFINITION ANALYSIS"
echo "Analyzing task definition..."
aws ecs describe-task-definition \
  --task-definition $TASK_DEF_ARN \
  --region $AWS_REGION > current_taskdef.json

# Check container image
IMAGE=$(jq -r '.taskDefinition.containerDefinitions[0].image' current_taskdef.json)
echo "Container Image: $IMAGE"

# Verify image exists in ECR
echo "Verifying image in ECR..."
REPO_URI=$(echo $IMAGE | cut -d':' -f1)
REPO_NAME=$(echo $REPO_URI | awk -F'/' '{print $2}')
TAG=$(echo $IMAGE | cut -d':' -f2)

if aws ecr describe-images \
  --repository-name $REPO_NAME \
  --image-ids imageTag=$TAG \
  --region $AWS_REGION &>/dev/null; then
  success "Image exists in ECR repository"
else
  error "Image not found in ECR. This may be why your tasks are failing to start."
  echo "Check that the Docker build and push steps were successful."
fi

# Check resource allocation
CPU=$(jq -r '.taskDefinition.cpu' current_taskdef.json)
MEMORY=$(jq -r '.taskDefinition.memory' current_taskdef.json)
echo "Task CPU Units: $CPU"
echo "Task Memory (MB): $MEMORY"

# Check essential environment variables for Auth0
echo "Checking critical environment variables..."
ENV_VARS=$(jq -r '.taskDefinition.containerDefinitions[0].environment' current_taskdef.json)

# Check for Auth0 env vars without showing secrets
if echo "$ENV_VARS" | jq -e '.[] | select(.name == "AUTH0_DOMAIN")' > /dev/null; then
  success "AUTH0_DOMAIN is set"
else
  warning "AUTH0_DOMAIN may be missing"
fi

if echo "$ENV_VARS" | jq -e '.[] | select(.name == "AUTH0_CLIENT_ID")' > /dev/null; then
  success "AUTH0_CLIENT_ID is set"
else
  warning "AUTH0_CLIENT_ID may be missing"
fi

DEPLOY_ID=$(echo "$ENV_VARS" | jq -r '.[] | select(.name == "DEPLOY_ID") | .value')
if [ -n "$DEPLOY_ID" ]; then
  echo "Deployment ID: $DEPLOY_ID"
else
  warning "DEPLOY_ID not found in environment variables"
fi

section "5. HTTPS CONFIGURATION CHECK"
echo "Checking HTTPS configuration on load balancer..."

# Get load balancer ARN
TARGET_GROUP_ARN=$(echo $SERVICE_JSON | jq -r '.services[0].loadBalancers[0].targetGroupArn')

if [ -n "$TARGET_GROUP_ARN" ] && [ "$TARGET_GROUP_ARN" != "null" ]; then
  echo "Target Group ARN: $TARGET_GROUP_ARN"
  
  # Get load balancer from target group
  LB_ARN=$(aws elbv2 describe-target-groups \
    --target-group-arns $TARGET_GROUP_ARN \
    --region $AWS_REGION \
    --query 'TargetGroups[0].LoadBalancerArns[0]' \
    --output text)
    
  echo "Load Balancer ARN: $LB_ARN"
  
  # Check HTTPS listener
  HTTPS_LISTENER=$(aws elbv2 describe-listeners \
    --load-balancer-arn $LB_ARN \
    --region $AWS_REGION \
    --query "Listeners[?Port==\`443\`]" \
    --output json)
    
  if [ -n "$HTTPS_LISTENER" ] && [ "$HTTPS_LISTENER" != "[]" ]; then
    success "HTTPS listener found on port 443"
    
    # Check certificate
    CERT_ARN=$(echo $HTTPS_LISTENER | jq -r '.[0].Certificates[0].CertificateArn')
    echo "Certificate ARN: $CERT_ARN"
    
    # Verify certificate is valid
    CERT_INFO=$(aws acm describe-certificate \
      --certificate-arn $CERT_ARN \
      --region $AWS_REGION)
      
    CERT_STATUS=$(echo $CERT_INFO | jq -r '.Certificate.Status')
    CERT_DOMAIN=$(echo $CERT_INFO | jq -r '.Certificate.DomainName')
    
    echo "Certificate Status: $CERT_STATUS"
    echo "Certificate Domain: $CERT_DOMAIN"
    
    if [ "$CERT_STATUS" != "ISSUED" ]; then
      error "Certificate is not in ISSUED state. SSL/TLS will not work properly."
    else
      success "Certificate is valid and issued"
    fi
  else
    error "No HTTPS listener found. Auth0 requires HTTPS to work properly."
    echo "Run the setup-https.sh script to configure HTTPS on your load balancer."
  fi
  
  # Check health check configuration
  TG_INFO=$(aws elbv2 describe-target-groups \
    --target-group-arns $TARGET_GROUP_ARN \
    --region $AWS_REGION)
    
  HEALTH_PATH=$(echo $TG_INFO | jq -r '.TargetGroups[0].HealthCheckPath')
  HEALTH_PORT=$(echo $TG_INFO | jq -r '.TargetGroups[0].HealthCheckPort')
  HEALTH_PROTOCOL=$(echo $TG_INFO | jq -r '.TargetGroups[0].HealthCheckProtocol')
  
  echo "Health Check Path: $HEALTH_PATH"
  echo "Health Check Port: $HEALTH_PORT"
  echo "Health Check Protocol: $HEALTH_PROTOCOL"
  
  if [ "$HEALTH_PATH" == "/" ] || [ "$HEALTH_PATH" == "/health" ]; then
    success "Health check path seems appropriate"
  else
    warning "Unusual health check path. Ensure this endpoint exists in your application."
  fi
  
  echo "Target group health check details:"
  echo $TG_INFO | jq '.TargetGroups[0] | {HealthCheckEnabled, HealthCheckIntervalSeconds, HealthCheckTimeoutSeconds, HealthyThresholdCount, UnhealthyThresholdCount}'
  
  # Check target group registration status
  TG_TARGETS=$(aws elbv2 describe-target-health \
    --target-group-arn $TARGET_GROUP_ARN \
    --region $AWS_REGION)
    
  TARGET_COUNT=$(echo $TG_TARGETS | jq '.TargetHealthDescriptions | length')
  
  if [ "$TARGET_COUNT" -eq 0 ]; then
    warning "No targets registered with the target group. This is expected during a failed deployment."
  else
    echo "Target group has $TARGET_COUNT registered targets:"
    echo $TG_TARGETS | jq -r '.TargetHealthDescriptions[] | "Target: \(.Target.Id) | State: \(.TargetHealth.State) | Reason: \(.TargetHealth.Reason)"'
  fi
else
  warning "Load balancer configuration not found for the service."
fi

section "6. NETWORK CONFIGURATION CHECK"
echo "Examining network configuration..."

# Check VPC configuration
NETWORK_CONFIG=$(echo $SERVICE_JSON | jq -r '.services[0].networkConfiguration.awsvpcConfiguration')
ASSIGN_PUBLIC_IP=$(echo $NETWORK_CONFIG | jq -r '.assignPublicIp')
SECURITY_GROUPS=$(echo $NETWORK_CONFIG | jq -r '.securityGroups[]')
SUBNETS=$(echo $NETWORK_CONFIG | jq -r '.subnets[]')

echo "Assign Public IP: $ASSIGN_PUBLIC_IP"
echo "Security Groups: $SECURITY_GROUPS"
echo "Subnets: $SUBNETS"

if [ "$ASSIGN_PUBLIC_IP" != "ENABLED" ]; then
  warning "Public IP is not enabled. Tasks in private subnets may not be able to reach the internet."
fi

# Check security group rules for inbound 80/443
for SG in $SECURITY_GROUPS; do
  echo "Checking security group: $SG"
  SG_RULES=$(aws ec2 describe-security-groups \
    --group-ids $SG \
    --region $AWS_REGION)
    
  INBOUND_80=$(echo $SG_RULES | jq -r '.SecurityGroups[0].IpPermissions[] | select(.FromPort==80 or (.FromPort<=80 and .ToPort>=80))')
  INBOUND_443=$(echo $SG_RULES | jq -r '.SecurityGroups[0].IpPermissions[] | select(.FromPort==443 or (.FromPort<=443 and .ToPort>=443))')
  
  if [ -z "$INBOUND_80" ]; then
    warning "Security group $SG may not allow inbound traffic on port 80"
  else
    success "Security group $SG allows HTTP traffic"
  fi
  
  if [ -z "$INBOUND_443" ]; then
    warning "Security group $SG may not allow inbound traffic on port 443"
  else
    success "Security group $SG allows HTTPS traffic"
  fi
  
  # Check outbound traffic
  OUTBOUND_ALL=$(echo $SG_RULES | jq -r '.SecurityGroups[0].IpPermissionsEgress[] | select(.IpProtocol=="-1")')
  if [ -z "$OUTBOUND_ALL" ]; then
    warning "Security group $SG may have restricted outbound traffic. This could prevent the container from reaching external services."
  else
    success "Security group $SG allows outbound traffic"
  fi
done

section "7. NGINX AND APPLICATION CONFIGURATION"
echo "Analyzing nginx.conf and application configuration..."

# If we could access the nginx.conf or build a check for it, we would do it here
echo "Checking for common Nginx configuration issues:

1. Check that nginx.conf is properly set up for HTTPS:
   - Should listen on port 80
   - Should not have hardcoded HTTP URLs
   - Should have a /health endpoint for load balancer health checks

2. Auth0 configuration requirements:
   - AUTH0_DOMAIN environment variable must be set
   - AUTH0_CLIENT_ID must be set
   - Callback URL should use HTTPS (https://lynqe.io/callback)"

section "8. TROUBLESHOOTING RECOMMENDATIONS"
echo -e "${BOLD}Based on analysis, here are potential issues and fixes:${NC}"

echo "1. Container startup failures:"
echo "   - Check CloudWatch logs for specific error messages"
echo "   - Verify the Docker image can start locally before deployment"
echo "   - Ensure your application starts on the correct port (typically 80)"

echo "2. Auth0/HTTPS configuration:"
echo "   - Confirm HTTPS is properly set up on your load balancer"
echo "   - Check that Auth0 callback URLs use HTTPS"
echo "   - Update Auth0 configuration to match your domain (lynqe.io)"

echo "3. Health check failures:"
echo "   - Implement a dedicated /health endpoint in your application"
echo "   - Make health checks less strict (increase thresholds and timeouts)"
echo "   - Verify the health check path in the target group matches your app"

echo "4. Network/Security groups:"
echo "   - Ensure containers have outbound internet access"
echo "   - Check that security groups allow traffic on required ports"
echo "   - Verify subnets have proper routing for both internal and external traffic"

echo "5. Quick test without load balancer:"
echo "   - Try deploying with DAEMON scheduling strategy temporarily"
echo "   - Deploy without load balancer to isolate container startup issues"

section "9. NEXT STEPS"
echo "1. Run 'setup-https.sh' to ensure HTTPS is configured correctly"
echo "2. Update health check configurations if too strict"
echo "3. Check container logs for specific error messages"
echo "4. If using Auth0, verify your callback URLs are HTTPS"
echo "5. Consider rebuilding and redeploying the Docker image"

echo -e "\n${BOLD}Run this script again after making changes to see if the issues persist.${NC}"
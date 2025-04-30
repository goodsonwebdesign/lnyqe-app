#!/bin/bash
# cloudwatch-dashboard.sh - Create a CloudWatch dashboard for ECS monitoring

AWS_REGION=${1:-"us-east-1"}  # Default to us-east-1 if not specified
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"
APP_NAME="lynqe-app"
DASHBOARD_NAME="lynqe-dashboard"

echo "Creating CloudWatch dashboard for ECS monitoring in region $AWS_REGION..."

# Get the service ARN 
SERVICE_ARN=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION | jq -r '.services[0].serviceArn')
echo "Service ARN: $SERVICE_ARN"

# Define dashboard body with metrics
DASHBOARD_BODY=$(cat << EOF
{
  "widgets": [
    {
      "type": "metric",
      "x": 0,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ECS", "CPUUtilization", "ServiceName", "$SERVICE_NAME", "ClusterName", "$CLUSTER_NAME" ]
        ],
        "period": 300,
        "stat": "Average",
        "region": "$AWS_REGION",
        "title": "CPU Utilization",
        "view": "timeSeries",
        "stacked": false
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ECS", "MemoryUtilization", "ServiceName", "$SERVICE_NAME", "ClusterName", "$CLUSTER_NAME" ]
        ],
        "period": 300,
        "stat": "Average",
        "region": "$AWS_REGION",
        "title": "Memory Utilization",
        "view": "timeSeries",
        "stacked": false
      }
    },
    {
      "type": "log",
      "x": 0,
      "y": 6,
      "width": 24,
      "height": 6,
      "properties": {
        "query": "SOURCE '/ecs/$APP_NAME' | fields @timestamp, @message\n| sort @timestamp desc\n| limit 100",
        "region": "$AWS_REGION",
        "title": "Application Logs",
        "view": "table"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 12,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ApplicationELB", "HTTPCode_Target_2XX_Count", "LoadBalancer", "app/lynqe-app-lb" ]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "$AWS_REGION",
        "title": "HTTP 200 OK",
        "view": "timeSeries",
        "stacked": false
      }
    },
    {
      "type": "metric",
      "x": 8,
      "y": 12,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ApplicationELB", "HTTPCode_Target_4XX_Count", "LoadBalancer", "app/lynqe-app-lb" ]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "$AWS_REGION",
        "title": "HTTP 4XX Errors",
        "view": "timeSeries",
        "stacked": false
      }
    },
    {
      "type": "metric",
      "x": 16,
      "y": 12,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", "app/lynqe-app-lb" ]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "$AWS_REGION",
        "title": "HTTP 5XX Errors",
        "view": "timeSeries",
        "stacked": false
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 18,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ECS", "RunningTaskCount", "ServiceName", "$SERVICE_NAME", "ClusterName", "$CLUSTER_NAME" ]
        ],
        "period": 60,
        "stat": "Maximum",
        "region": "$AWS_REGION",
        "title": "Running Tasks",
        "view": "timeSeries",
        "stacked": false
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 18,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", "app/lynqe-app-lb" ]
        ],
        "period": 300,
        "stat": "Average",
        "region": "$AWS_REGION",
        "title": "Response Time",
        "view": "timeSeries",
        "stacked": false
      }
    }
  ]
}
EOF
)

# Create the dashboard
echo "Creating dashboard: $DASHBOARD_NAME"
aws cloudwatch put-dashboard --dashboard-name "$DASHBOARD_NAME" --dashboard-body "$DASHBOARD_BODY" --region $AWS_REGION

echo "CloudWatch dashboard created successfully!"
echo ""
echo "View your dashboard at:"
echo "https://$AWS_REGION.console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#dashboards:name=$DASHBOARD_NAME"
echo ""
echo "To set up alerts for your application, consider creating CloudWatch Alarms for:"
echo "- CPU/Memory utilization exceeding thresholds"
echo "- HTTP 5XX error rate increasing"
echo "- Running task count dropping below desired capacity"
echo ""
echo "Example alarm command:"
echo "aws cloudwatch put-metric-alarm --alarm-name high-cpu-usage \\"
echo "  --alarm-description \"Alarm when CPU exceeds 80%\" \\"
echo "  --metric-name CPUUtilization \\"
echo "  --namespace AWS/ECS \\"
echo "  --statistic Average \\"
echo "  --period 300 \\"
echo "  --threshold 80 \\"
echo "  --comparison-operator GreaterThanThreshold \\"
echo "  --dimensions Name=ClusterName,Value=$CLUSTER_NAME Name=ServiceName,Value=$SERVICE_NAME \\"
echo "  --evaluation-periods 2 \\"
echo "  --alarm-actions arn:aws:sns:$AWS_REGION:YOUR_ACCOUNT_ID:YOUR_SNS_TOPIC \\"
echo "  --region $AWS_REGION"
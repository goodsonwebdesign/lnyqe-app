#!/bin/bash
# region-sync-checker.sh - Check and sync AWS resources across regions

echo "=== AWS Region Resources Checker ==="
echo "This script will check resources across regions and help resolve region mismatches."

# Define regions to check
REGIONS=("us-east-1" "us-east-2")
CLUSTER_NAME="lynqe-cluster"
SERVICE_NAME="lynqe-service"
APP_NAME="lynqe-app"

echo -e "\n=== Checking ECS Clusters ==="
for region in "${REGIONS[@]}"; do
  echo -e "\nRegion: $region"
  clusters=$(aws ecs list-clusters --region $region --query 'clusterArns[]' --output text)

  if [ -z "$clusters" ]; then
    echo "  No ECS clusters found in $region"
  else
    echo "  ECS clusters in $region:"
    for cluster in $clusters; do
      echo "    - $cluster"

      # Check for the specific service
      service_check=$(aws ecs describe-services --cluster $cluster --services $SERVICE_NAME --region $region --query 'services[0].status' --output text 2>/dev/null)

      if [ "$service_check" == "ACTIVE" ]; then
        echo "      * $SERVICE_NAME service is ACTIVE in this cluster"

        # Check running tasks
        running_tasks=$(aws ecs list-tasks --cluster $cluster --service-name $SERVICE_NAME --desired-status RUNNING --region $region --query 'taskArns' --output text)
        if [ -n "$running_tasks" ]; then
          echo "      * Has running tasks: $running_tasks"

          # Get task details
          for task in $running_tasks; do
            task_def=$(aws ecs describe-tasks --cluster $cluster --tasks $task --region $region --query 'tasks[0].taskDefinitionArn' --output text)
            echo "        Task definition: $task_def"
          done
        else
          echo "      * No running tasks in this service"
        fi
      fi
    done
  fi
done

echo -e "\n=== Checking ECR Repositories ==="
for region in "${REGIONS[@]}"; do
  echo -e "\nRegion: $region"
  repos=$(aws ecr describe-repositories --region $region --query 'repositories[*].repositoryName' --output text)

  if [ -z "$repos" ]; then
    echo "  No ECR repositories found in $region"
  else
    for repo in $repos; do
      echo "  - $repo"

      if [ "$repo" == "$APP_NAME" ]; then
        echo "    * Target repository found in $region"

        # Check recent images
        images=$(aws ecr describe-images --repository-name $repo --region $region --query 'imageDetails[0:3].[imageTags[0],imagePushedAt]' --output text)
        echo "    * Recent images:"
        echo "$images" | while read -r line; do
          echo "      $line"
        done
      fi
    done
  fi
done

echo -e "\n=== Checking Load Balancers ==="
for region in "${REGIONS[@]}"; do
  echo -e "\nRegion: $region"
  lbs=$(aws elbv2 describe-load-balancers --region $region --query 'LoadBalancers[*].LoadBalancerArn' --output text)

  if [ -z "$lbs" ]; then
    echo "  No load balancers found in $region"
  else
    for lb in $lbs; do
      echo "  - $lb"

      # Get LB details
      lb_dns=$(aws elbv2 describe-load-balancers --load-balancer-arns $lb --region $region --query 'LoadBalancers[0].DNSName' --output text)
      echo "    * DNS: $lb_dns"

      # Check target groups
      tgs=$(aws elbv2 describe-target-groups --load-balancer-arn $lb --region $region --query 'TargetGroups[*].TargetGroupArn' --output text)

      for tg in $tgs; do
        echo "    * Target Group: $tg"

        # Check targets
        targets=$(aws elbv2 describe-target-health --target-group-arn $tg --region $region --query 'TargetHealthDescriptions[*].[Target.Id,TargetHealth.State]' --output text)
        if [ -n "$targets" ]; then
          echo "      Targets:"
          echo "$targets" | while read -r id state; do
            echo "      - $id: $state"
          done
        else
          echo "      No targets registered"
        fi
      done
    done
  fi
done

echo -e "\n=== Recommendations ==="
# Determine which region has the most resources
primary_region="us-east-2"  # Default to us-east-2 since that's where your ALB is

echo "Based on the analysis, it appears your primary region should be: $primary_region"
echo "Would you like to fix the region mismatch by standardizing on $primary_region? (y/n)"
read -p "> " confirm

if [ "$confirm" == "y" ]; then
  echo "Starting region synchronization..."

  # Find the most recent task definition in either region
  latest_task_def=""
  latest_revision=0

  for region in "${REGIONS[@]}"; do
    task_defs=$(aws ecs list-task-definitions --family-prefix $APP_NAME --region $region --query 'taskDefinitionArns' --output text)

    for task_def in $task_defs; do
      revision=$(echo $task_def | grep -o '[0-9]*$')

      if [ "$revision" -gt "$latest_revision" ]; then
        latest_revision=$revision
        latest_task_def=$task_def
        latest_region=$region
      fi
    done
  done

  echo "Latest task definition: $latest_task_def (revision $latest_revision) in $latest_region"

  # Copy the latest task definition to the primary region if needed
  if [ "$latest_region" != "$primary_region" ]; then
    echo "Copying latest task definition from $latest_region to $primary_region..."

    # Get the task definition
    task_def_json=$(aws ecs describe-task-definition --task-definition $latest_task_def --region $latest_region --query 'taskDefinition' --output json)

    # Remove fields that can't be specified for a new task definition
    cleaned_task_def=$(echo $task_def_json | jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)')

    # Register the task definition in the primary region
    echo "Registering task definition in $primary_region..."
    new_task_def=$(aws ecs register-task-definition --cli-input-json "$cleaned_task_def" --region $primary_region --query 'taskDefinition.taskDefinitionArn' --output text)

    echo "New task definition registered in $primary_region: $new_task_def"

    # Update the service in the primary region
    echo "Updating service in $primary_region with new task definition..."
    aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition $new_task_def --region $primary_region

    echo "Service updated successfully!"
  else
    echo "Latest task definition is already in the primary region."
  fi

  echo "Checking service and making sure it's connected to the load balancer..."
  # Get target group ARN
  target_group_arn=$(aws elbv2 describe-target-groups --region $primary_region --query 'TargetGroups[0].TargetGroupArn' --output text)

  if [ -n "$target_group_arn" ]; then
    echo "Ensuring service is connected to target group: $target_group_arn"
    aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --load-balancers "targetGroupArn=$target_group_arn,containerName=${APP_NAME}-container,containerPort=80" --force-new-deployment --region $primary_region

    echo "Service updated with load balancer configuration and force-deployed."
  else
    echo "No target group found in $primary_region."
  fi

  echo "Region synchronization complete!"
else
  echo "No changes made. Please manually resolve the region mismatch based on the information above."
fi

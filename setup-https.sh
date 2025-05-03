#!/bin/bash
# setup-https.sh - Script to configure HTTPS on AWS ALB for the lynqe-app

set -e

# Configuration
AWS_REGION="us-east-2"  # Same region as your ECS service
ALB_NAME="lynqe-app-lb"  # Your load balancer name
DOMAIN_NAME="lynqe.io"  # Your actual domain

# Step 1: Check if the load balancer exists
echo "Checking for load balancer..."
ALB_ARN=$(aws elbv2 describe-load-balancers --query "LoadBalancers[?contains(DNSName, 'lynqe')].LoadBalancerArn" --output text --region $AWS_REGION)

if [ -z "$ALB_ARN" ]; then
  echo "Error: Load balancer not found. Please make sure it's created."
  exit 1
fi

# Get load balancer DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query "LoadBalancers[0].DNSName" --output text --region $AWS_REGION)
echo "Found load balancer: $ALB_DNS"

# Step 2: Check for existing certificate before requesting a new one
echo "Checking for existing certificates for domain: $DOMAIN_NAME"
CERT_LIST=$(aws acm list-certificates --region $AWS_REGION)
EXISTING_CERT_ARN=$(echo "$CERT_LIST" | jq -r ".CertificateSummaryList[] | select(.DomainName == \"$DOMAIN_NAME\") | .CertificateArn" | head -n 1)

if [ -n "$EXISTING_CERT_ARN" ]; then
  echo "Found existing certificate for $DOMAIN_NAME: $EXISTING_CERT_ARN"
  CERT_ARN=$EXISTING_CERT_ARN
  
  # Check certificate status
  CERT_STATUS=$(aws acm describe-certificate --certificate-arn $CERT_ARN --region $AWS_REGION --query "Certificate.Status" --output text)
  echo "Certificate status: $CERT_STATUS"
  
  if [ "$CERT_STATUS" != "ISSUED" ]; then
    echo "Certificate is not in ISSUED state. Current status: $CERT_STATUS"
    echo "You need to complete the certificate validation process."
    
    # Get validation details
    CERT_DETAILS=$(aws acm describe-certificate --certificate-arn $CERT_ARN --region $AWS_REGION)
    VALIDATION_DOMAIN=$(echo $CERT_DETAILS | jq -r '.Certificate.DomainValidationOptions[0].DomainName')
    VALIDATION_NAME=$(echo $CERT_DETAILS | jq -r '.Certificate.DomainValidationOptions[0].ResourceRecord.Name')
    VALIDATION_VALUE=$(echo $CERT_DETAILS | jq -r '.Certificate.DomainValidationOptions[0].ResourceRecord.Value')
    
    echo "Please add this DNS validation record to your domain's DNS settings:"
    echo "Name: $VALIDATION_NAME"
    echo "Type: CNAME"
    echo "Value: $VALIDATION_VALUE"
    
    NEEDS_VALIDATION=true
  else
    echo "Certificate is already in ISSUED state. No validation needed."
    NEEDS_VALIDATION=false
  fi
else
  # Request a new certificate if none exists
  echo "No existing certificate found. Requesting SSL certificate from AWS Certificate Manager..."
  echo "Requesting certificate for domain: $DOMAIN_NAME"
  CERT_ARN=$(aws acm request-certificate \
    --domain-name $DOMAIN_NAME \
    --validation-method DNS \
    --region $AWS_REGION \
    --query CertificateArn \
    --output text)

  echo "Certificate requested. ARN: $CERT_ARN"
  echo "Getting DNS validation records..."

  # Wait for certificate details to be available
  sleep 5
  CERT_DETAILS=$(aws acm describe-certificate --certificate-arn $CERT_ARN --region $AWS_REGION)
  VALIDATION_DOMAIN=$(echo $CERT_DETAILS | jq -r '.Certificate.DomainValidationOptions[0].DomainName')
  VALIDATION_NAME=$(echo $CERT_DETAILS | jq -r '.Certificate.DomainValidationOptions[0].ResourceRecord.Name')
  VALIDATION_VALUE=$(echo $CERT_DETAILS | jq -r '.Certificate.DomainValidationOptions[0].ResourceRecord.Value')

  echo "Please add this DNS validation record to your domain's DNS settings:"
  echo "Name: $VALIDATION_NAME"
  echo "Type: CNAME"
  echo "Value: $VALIDATION_VALUE"
  
  NEEDS_VALIDATION=true
fi

# Only do DNS validation if needed
if [ "$NEEDS_VALIDATION" = true ]; then
  # Check if domain is managed by Route 53
  echo "Checking if domain is managed by Route 53..."
  ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name $DOMAIN_NAME --query "HostedZones[?Name==\`$DOMAIN_NAME.\`].Id" --output text | sed 's/\/hostedzone\///')

  if [ -n "$ZONE_ID" ]; then
    echo "Domain is managed by Route 53. Zone ID: $ZONE_ID"
    echo "Would you like to automatically add the validation record to Route 53? (y/n)"
    read VALIDATE_AUTO

    if [[ "$VALIDATE_AUTO" == "y" || "$VALIDATE_AUTO" == "Y" ]]; then
      echo "Adding validation record to Route 53..."
      aws route53 change-resource-record-sets \
        --hosted-zone-id $ZONE_ID \
        --change-batch '{
          "Changes": [
            {
              "Action": "UPSERT",
              "ResourceRecordSet": {
                "Name": "'"$VALIDATION_NAME"'",
                "Type": "CNAME",
                "TTL": 300,
                "ResourceRecords": [
                  {
                    "Value": "'"$VALIDATION_VALUE"'"
                  }
                ]
              }
            }
          ]
        }'
      echo "Validation record added to Route 53"
    else
      echo "Please add the DNS validation records manually to your domain's DNS settings."
      echo "Press Enter after you've added the DNS validation records and the certificate shows as 'ISSUED'..."
      read -p ""
    fi
  else
    echo "Domain not managed by Route 53 or no access to list hosted zones."
    echo "Please add the DNS validation records manually to your domain's DNS settings."
    echo "Press Enter after you've added the DNS validation records and the certificate shows as 'ISSUED'..."
    read -p ""
  fi

  # Wait for certificate validation if the certificate isn't already validated
  CERT_STATUS=$(aws acm describe-certificate --certificate-arn $CERT_ARN --region $AWS_REGION --query "Certificate.Status" --output text)
  if [ "$CERT_STATUS" != "ISSUED" ]; then
    echo "Waiting for certificate validation... This may take several minutes."
    aws acm wait certificate-validated --certificate-arn $CERT_ARN --region $AWS_REGION
    echo "Certificate validated successfully!"
  fi
else
  echo "Skipping DNS validation since certificate is already validated."
fi

# Step 3: Find the target group for the load balancer
echo "Finding target group..."
TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups \
  --query "TargetGroups[?contains(TargetGroupArn, 'lynqe')].TargetGroupArn" \
  --output text \
  --region $AWS_REGION)

if [ -z "$TARGET_GROUP_ARN" ]; then
  echo "Error: Target group not found."
  exit 1
fi

echo "Found target group: $TARGET_GROUP_ARN"

# Step 4: Check for existing HTTPS listener and create one if it doesn't exist
echo "Checking for existing HTTPS listener..."
HTTPS_LISTENER_ARN=$(aws elbv2 describe-listeners \
  --load-balancer-arn $ALB_ARN \
  --query "Listeners[?Port==\`443\`].ListenerArn" \
  --output text \
  --region $AWS_REGION)

if [ -n "$HTTPS_LISTENER_ARN" ]; then
  echo "HTTPS listener already exists. Updating certificate..."
  aws elbv2 modify-listener \
    --listener-arn $HTTPS_LISTENER_ARN \
    --certificates CertificateArn=$CERT_ARN \
    --region $AWS_REGION
  
  echo "HTTPS listener updated with new certificate"
else
  echo "Creating HTTPS listener on port 443..."
  HTTPS_LISTENER_ARN=$(aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTPS \
    --port 443 \
    --certificates CertificateArn=$CERT_ARN \
    --ssl-policy ELBSecurityPolicy-2016-08 \
    --default-actions Type=forward,TargetGroupArn=$TARGET_GROUP_ARN \
    --region $AWS_REGION \
    --query 'Listeners[0].ListenerArn' \
    --output text)

  echo "HTTPS listener created: $HTTPS_LISTENER_ARN"
fi

# Step 5: Check if HTTP listener exists and update it to redirect to HTTPS
echo "Checking for existing HTTP listener..."
HTTP_LISTENER_ARN=$(aws elbv2 describe-listeners \
  --load-balancer-arn $ALB_ARN \
  --query "Listeners[?Port==\`80\`].ListenerArn" \
  --output text \
  --region $AWS_REGION)

if [ -n "$HTTP_LISTENER_ARN" ]; then
  echo "Modifying HTTP listener to redirect to HTTPS..."
  aws elbv2 modify-listener \
    --listener-arn $HTTP_LISTENER_ARN \
    --port 80 \
    --protocol HTTP \
    --default-actions "Type=redirect,RedirectConfig={Protocol=HTTPS,Port=443,StatusCode=HTTP_301}" \
    --region $AWS_REGION

  echo "HTTP listener now redirects to HTTPS"
else
  echo "No HTTP listener found. Creating one with redirect to HTTPS..."
  aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTP \
    --port 80 \
    --default-actions "Type=redirect,RedirectConfig={Protocol=HTTPS,Port=443,StatusCode=HTTP_301}" \
    --region $AWS_REGION

  echo "Created HTTP listener with redirect to HTTPS"
fi

# Step 6: Create Route 53 Alias record for apex domain (if domain is managed by Route 53)
echo "Checking if domain is managed by Route 53 for DNS setup..."
ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name $DOMAIN_NAME --query "HostedZones[?Name==\`$DOMAIN_NAME.\`].Id" --output text | sed 's/\/hostedzone\///')

if [ -n "$ZONE_ID" ]; then
  echo "Domain is managed by Route 53. Zone ID: $ZONE_ID"
  echo "Would you like to create/update DNS records to point to your load balancer? (y/n)"
  read UPDATE_DNS
  
  if [[ "$UPDATE_DNS" == "y" || "$UPDATE_DNS" == "Y" ]]; then
    echo "Creating Route 53 Alias record for apex domain..."
    # Get the hosted zone ID for the ALB
    ALB_HOSTED_ZONE_ID=$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query "LoadBalancers[0].CanonicalHostedZoneId" --output text --region $AWS_REGION)

    echo "Creating A record alias for apex domain to ALB..."
    aws route53 change-resource-record-sets \
      --hosted-zone-id $ZONE_ID \
      --change-batch '{
        "Changes": [
          {
            "Action": "UPSERT",
            "ResourceRecordSet": {
              "Name": "'"$DOMAIN_NAME"'",
              "Type": "A",
              "AliasTarget": {
                "HostedZoneId": "'"$ALB_HOSTED_ZONE_ID"'",
                "DNSName": "'"$ALB_DNS"'",
                "EvaluateTargetHealth": true
              }
            }
          }
        ]
      }'

    echo "Route 53 Alias record for apex domain created successfully!"
    echo "Also creating a 'www' subdomain alias..."
    aws route53 change-resource-record-sets \
      --hosted-zone-id $ZONE_ID \
      --change-batch '{
        "Changes": [
          {
            "Action": "UPSERT",
            "ResourceRecordSet": {
              "Name": "www.'"$DOMAIN_NAME"'",
              "Type": "A",
              "AliasTarget": {
                "HostedZoneId": "'"$ALB_HOSTED_ZONE_ID"'",
                "DNSName": "'"$ALB_DNS"'",
                "EvaluateTargetHealth": true
              }
            }
          }
        ]
      }'

    echo "Route 53 Alias record for www subdomain created successfully!"
  else
    echo "Skipping DNS record creation/update."
  fi
else
  echo "IMPORTANT: Since your domain is not managed by Route 53, you need to set up DNS records manually."
  echo "For an apex domain (lynqe.io), you cannot use a regular CNAME record."
  echo "Options:"
  echo "1. If your DNS provider supports ALIAS/ANAME records for apex domains, create one pointing to: $ALB_DNS"
  echo "2. Create a CNAME record for 'www.lynqe.io' pointing to: $ALB_DNS"
  echo "3. Consider transferring DNS management to Route 53 for better AWS integration"
fi

echo "HTTPS configuration completed successfully!"
echo "Once DNS propagates, your application should be accessible via HTTPS at: https://$DOMAIN_NAME"
echo "Now that HTTPS is set up, Auth0 should work properly with your application."

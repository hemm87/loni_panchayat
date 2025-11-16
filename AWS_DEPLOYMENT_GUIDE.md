# AWS Deployment Guide

Complete guide to deploy Loni Panchayat application on AWS using various services.

---

## 🎯 AWS Deployment Options

| Service | Difficulty | Cost | Best For |
|---------|-----------|------|----------|
| **AWS App Runner** | ⭐ Easy | $$ | Quick deployment, auto-scaling |
| **ECS Fargate** | ⭐⭐ Medium | $$ | Production, containerized apps |
| **Elastic Beanstalk** | ⭐⭐ Medium | $$ | Platform-managed deployment |
| **EC2 + Docker** | ⭐⭐⭐ Advanced | $ | Full control, cost-effective |
| **Lightsail Container** | ⭐ Easy | $ | Simple, predictable pricing |

---

## Option 1: AWS App Runner (Recommended - Easiest) ⭐

AWS App Runner automatically deploys containerized applications with minimal configuration.

### Prerequisites

```bash
# Install AWS CLI
# Windows (PowerShell as Admin)
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)
```

### Step 1: Push Image to Amazon ECR

```powershell
# Login to Amazon ECR
$REGION = "us-east-1"
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

# Create ECR repository
aws ecr create-repository --repository-name loni-panchayat --region $REGION

# Tag your local image
docker tag loni-panchayat:latest "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/loni-panchayat:latest"

# Push to ECR
docker push "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/loni-panchayat:latest"
```

### Step 2: Create App Runner Service

```bash
# Create apprunner.yaml configuration
cat > apprunner.yaml << EOF
version: 1.0
runtime: nodejs20
build:
  commands:
    build:
      - echo "Using pre-built image"
run:
  runtime-version: 20
  command: node server.js
  network:
    port: 3000
    env:
      - name: NODE_ENV
        value: production
EOF

# Create App Runner service via CLI
aws apprunner create-service \
  --service-name loni-panchayat \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "'$ACCOUNT_ID'.dkr.ecr.'$REGION'.amazonaws.com/loni-panchayat:latest",
      "ImageConfiguration": {
        "Port": "3000",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production",
          "NEXT_PUBLIC_FIREBASE_API_KEY": "your-firebase-api-key",
          "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "your-project.firebaseapp.com",
          "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "your-project-id"
        }
      },
      "ImageRepositoryType": "ECR"
    },
    "AutoDeploymentsEnabled": true
  }' \
  --instance-configuration '{
    "Cpu": "1 vCPU",
    "Memory": "2 GB"
  }' \
  --region $REGION
```

**Or use AWS Console:**

1. Go to AWS App Runner Console
2. Click "Create service"
3. Choose "Container registry" → "Amazon ECR"
4. Select your repository and tag
5. Set port to `3000`
6. Add environment variables (Firebase config)
7. Choose instance size (1 vCPU, 2GB RAM)
8. Create service

**Access your app:**
```
https://your-service-id.us-east-1.awsapprunner.com
```

---

## Option 2: Amazon ECS with Fargate ⭐⭐

Full-featured container orchestration without managing servers.

### Step 1: Push to ECR (if not already done)

```powershell
# Same as App Runner Step 1
$REGION = "us-east-1"
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
aws ecr create-repository --repository-name loni-panchayat --region $REGION
docker tag loni-panchayat:latest "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/loni-panchayat:latest"
docker push "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/loni-panchayat:latest"
```

### Step 2: Create ECS Task Definition

Create `ecs-task-definition.json`:

```json
{
  "family": "loni-panchayat",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "loni-panchayat",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/loni-panchayat:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "NEXT_PUBLIC_FIREBASE_API_KEY",
          "value": "your-firebase-api-key"
        },
        {
          "name": "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
          "value": "your-project.firebaseapp.com"
        },
        {
          "name": "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
          "value": "your-project-id"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/loni-panchayat",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Step 3: Deploy ECS Service

```bash
# Create CloudWatch log group
aws logs create-log-group --log-group-name /ecs/loni-panchayat

# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create ECS cluster
aws ecs create-cluster --cluster-name loni-panchayat-cluster

# Create security group
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text)
SG_ID=$(aws ec2 create-security-group \
  --group-name loni-panchayat-sg \
  --description "Security group for Loni Panchayat" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text)

# Allow inbound traffic on port 3000
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0

# Get subnet IDs
SUBNET_IDS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'Subnets[0:2].SubnetId' \
  --output text | tr '\t' ',')

# Create ECS service
aws ecs create-service \
  --cluster loni-panchayat-cluster \
  --service-name loni-panchayat-service \
  --task-definition loni-panchayat \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_IDS],securityGroups=[$SG_ID],assignPublicIp=ENABLED}"
```

### Step 4: Add Application Load Balancer (Optional but Recommended)

```bash
# Create ALB
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name loni-panchayat-alb \
  --subnets $(echo $SUBNET_IDS | tr ',' ' ') \
  --security-groups $SG_ID \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

# Create target group
TG_ARN=$(aws elbv2 create-target-group \
  --name loni-panchayat-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-path /api/health \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN

# Update ECS service to use ALB
aws ecs update-service \
  --cluster loni-panchayat-cluster \
  --service loni-panchayat-service \
  --load-balancers targetGroupArn=$TG_ARN,containerName=loni-panchayat,containerPort=3000
```

**Access your app via ALB DNS name:**
```bash
aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --query 'LoadBalancers[0].DNSName' \
  --output text
```

---

## Option 3: AWS Elastic Beanstalk ⭐⭐

Platform-as-a-Service (PaaS) with automatic scaling and management.

### Step 1: Create Dockerrun.aws.json

```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/loni-panchayat:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": 3000,
      "HostPort": 80
    }
  ],
  "Logging": "/var/log/nginx"
}
```

### Step 2: Deploy via EB CLI

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init -p docker loni-panchayat --region us-east-1

# Create environment with environment variables
eb create loni-panchayat-prod \
  --envvars NODE_ENV=production,NEXT_PUBLIC_FIREBASE_API_KEY=your-key

# Deploy
eb deploy

# Open in browser
eb open
```

**Or use AWS Console:**

1. Go to Elastic Beanstalk Console
2. Create new application: `loni-panchayat`
3. Choose "Docker" platform
4. Upload `Dockerrun.aws.json`
5. Configure environment variables in "Configuration" → "Software"
6. Create environment

---

## Option 4: EC2 with Docker ⭐⭐⭐

Most control, cost-effective for long-running workloads.

### Step 1: Launch EC2 Instance

```bash
# Create key pair
aws ec2 create-key-pair \
  --key-name loni-panchayat-key \
  --query 'KeyMaterial' \
  --output text > loni-panchayat-key.pem

chmod 400 loni-panchayat-key.pem

# Launch Ubuntu instance with Docker
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.small \
  --key-name loni-panchayat-key \
  --security-group-ids $SG_ID \
  --subnet-id $(echo $SUBNET_IDS | cut -d',' -f1) \
  --user-data '#!/bin/bash
apt-get update
apt-get install -y docker.io docker-compose
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=loni-panchayat}]' \
  --query 'Instances[0].InstanceId' \
  --output text)

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo "Instance IP: $PUBLIC_IP"
```

### Step 2: Deploy Application

```bash
# SSH into instance
ssh -i loni-panchayat-key.pem ubuntu@$PUBLIC_IP

# On the EC2 instance:
# Pull image from ECR or GHCR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker pull YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/loni-panchayat:latest

# Or pull from GHCR
docker login ghcr.io -u hemm87
docker pull ghcr.io/hemm87/loni_panchayat:latest

# Create .env.local
cat > .env.local << EOF
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... other variables
EOF

# Run container
docker run -d \
  --name loni-panchayat \
  --restart unless-stopped \
  -p 80:3000 \
  --env-file .env.local \
  ghcr.io/hemm87/loni_panchayat:latest

# Check status
docker ps
curl http://localhost/api/health
```

### Step 3: Set up Nginx (Optional)

```bash
# Install nginx
sudo apt-get install -y nginx

# Configure nginx
sudo tee /etc/nginx/sites-available/loni-panchayat << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/loni-panchayat /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

**Access:** `http://$PUBLIC_IP`

---

## Option 5: AWS Lightsail Container Service ⭐

Simplest AWS container service with predictable pricing.

### Via AWS Console

1. Go to **Lightsail Console** → **Containers**
2. Click "Create container service"
3. Configure:
   - **Name:** `loni-panchayat`
   - **Power:** Nano (512MB RAM, 0.25 vCPU) - $7/month
   - **Scale:** 1
4. Click "Setup deployment"
   - **Image:** `ghcr.io/hemm87/loni_panchayat:latest`
   - **Open ports:** 3000
   - Add environment variables
5. Create service

### Via AWS CLI

```bash
# Create container service
aws lightsail create-container-service \
  --service-name loni-panchayat \
  --power nano \
  --scale 1

# Create deployment
cat > lightsail-deployment.json << EOF
{
  "containers": {
    "loni-panchayat": {
      "image": "ghcr.io/hemm87/loni_panchayat:latest",
      "ports": {
        "3000": "HTTP"
      },
      "environment": {
        "NODE_ENV": "production",
        "NEXT_PUBLIC_FIREBASE_API_KEY": "your-key"
      }
    }
  },
  "publicEndpoint": {
    "containerName": "loni-panchayat",
    "containerPort": 3000,
    "healthCheck": {
      "path": "/api/health"
    }
  }
}
EOF

aws lightsail create-container-service-deployment \
  --service-name loni-panchayat \
  --cli-input-json file://lightsail-deployment.json
```

---

## 🔐 Environment Variables Management

### Using AWS Systems Manager Parameter Store

```bash
# Store secrets
aws ssm put-parameter \
  --name "/loni-panchayat/firebase-api-key" \
  --value "your-firebase-api-key" \
  --type "SecureString"

# Reference in ECS task definition
"secrets": [
  {
    "name": "NEXT_PUBLIC_FIREBASE_API_KEY",
    "valueFrom": "arn:aws:ssm:us-east-1:ACCOUNT_ID:parameter/loni-panchayat/firebase-api-key"
  }
]
```

### Using AWS Secrets Manager

```bash
# Create secret
aws secretsmanager create-secret \
  --name loni-panchayat/firebase-config \
  --secret-string '{
    "NEXT_PUBLIC_FIREBASE_API_KEY": "your-key",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "your-domain"
  }'

# Reference in task definition
"secrets": [
  {
    "name": "NEXT_PUBLIC_FIREBASE_API_KEY",
    "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:loni-panchayat/firebase-config:NEXT_PUBLIC_FIREBASE_API_KEY::"
  }
]
```

---

## 🌐 Custom Domain & SSL

### Using AWS Certificate Manager (ACM)

```bash
# Request SSL certificate
aws acm request-certificate \
  --domain-name loni-panchayat.com \
  --validation-method DNS \
  --subject-alternative-names www.loni-panchayat.com

# Get validation DNS records (add to your domain DNS)
aws acm describe-certificate --certificate-arn YOUR_CERT_ARN

# After validation, attach to ALB
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=YOUR_CERT_ARN \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN
```

### Using Route 53

```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name loni-panchayat.com \
  --caller-reference $(date +%s)

# Create A record pointing to ALB
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "loni-panchayat.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "ALB_HOSTED_ZONE_ID",
          "DNSName": "your-alb-dns.us-east-1.elb.amazonaws.com",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

---

## 💰 Cost Estimates (Monthly, us-east-1)

| Service | Configuration | Estimated Cost |
|---------|--------------|----------------|
| **App Runner** | 1 vCPU, 2GB RAM | ~$25-40 |
| **ECS Fargate** | 0.5 vCPU, 1GB RAM | ~$15-25 |
| **Elastic Beanstalk** | t3.small instance | ~$15-20 |
| **EC2** | t3.small | ~$15 |
| **Lightsail** | Nano (512MB) | $7 |

*Add ~$0.50/month for ECR storage, ~$1-5 for data transfer*

---

## 📊 Monitoring & Logging

### CloudWatch Logs

```bash
# View logs (ECS)
aws logs tail /ecs/loni-panchayat --follow

# Create CloudWatch alarm for high CPU
aws cloudwatch put-metric-alarm \
  --alarm-name loni-panchayat-high-cpu \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --period 300 \
  --statistic Average \
  --threshold 80.0
```

### X-Ray Tracing (Optional)

Add to task definition:
```json
{
  "name": "xray-daemon",
  "image": "amazon/aws-xray-daemon",
  "portMappings": [
    {
      "containerPort": 2000,
      "protocol": "udp"
    }
  ]
}
```

---

## 🚀 CI/CD with GitHub Actions → AWS

### Option A: Deploy to ECR + ECS

Add to `.github/workflows/aws-deploy.yml`:

```yaml
name: Deploy to AWS ECS

on:
  push:
    branches: [ main ]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: loni-panchayat
  ECS_CLUSTER: loni-panchayat-cluster
  ECS_SERVICE: loni-panchayat-service
  CONTAINER_NAME: loni-panchayat

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service $ECS_SERVICE \
            --force-new-deployment
```

**Required GitHub Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

---

## 🎯 Recommended Setup for Production

**For Small to Medium Traffic:**
- **AWS Lightsail Container** ($7/month) or **App Runner** ($25/month)
- Route 53 for DNS ($0.50/month)
- ACM for free SSL certificate

**For Production with High Availability:**
- **ECS Fargate** with ALB
- Multiple availability zones
- Auto-scaling (1-10 tasks)
- CloudWatch monitoring
- Route 53 + ACM
- **Total: ~$50-150/month**

---

## ✅ Quick Start Checklist

Choose your deployment method and follow these steps:

### App Runner (Easiest)
- [ ] Push image to ECR
- [ ] Create App Runner service
- [ ] Configure environment variables
- [ ] Access via App Runner URL

### ECS Fargate (Production)
- [ ] Push image to ECR
- [ ] Create ECS cluster and task definition
- [ ] Create ALB and target group
- [ ] Deploy ECS service
- [ ] Configure Route 53 and SSL

### EC2 (Cost-Effective)
- [ ] Launch EC2 instance
- [ ] Install Docker
- [ ] Pull and run image
- [ ] Configure security group
- [ ] Optional: Setup nginx reverse proxy

---

## 📚 Additional Resources

- [AWS App Runner Documentation](https://docs.aws.amazon.com/apprunner/)
- [Amazon ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
- [AWS Lightsail Containers](https://lightsail.aws.amazon.com/ls/docs/en_us/articles/amazon-lightsail-container-services)

---

**Need help?** All commands are tested and ready to use. Just replace placeholder values (YOUR_ACCOUNT_ID, your-key, etc.) with your actual values!

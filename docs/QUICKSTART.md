# AWS SaaS Starter Kit — Quick Start

Get the starter kit running on your own AWS account.

The infrastructure is designed so that **each installation automatically receives a unique installation ID**. AWS resources such as DynamoDB tables, Lambda, Cognito, API Gateway, IAM and CloudFront-related resources use this ID in their names.

You can deploy the same starter kit multiple times, including multiple installations in the same AWS account, without manually renaming the application resources.

## Requirements

* AWS account
* AWS CLI
* Node.js 24+
* npm
* Terraform 1.13+

## 1. Configure AWS

Configure your AWS credentials:

```bash
aws configure
aws sts get-caller-identity
```

Make sure the returned account is the AWS account where you want to deploy the application.

## 2. Configure Terraform state

Terraform needs an S3 bucket to store its remote state.

Create an S3 bucket in your AWS account for the Terraform state.

Then copy the example backend configuration:

```bash
cp terraform/backend.hcl.example terraform/backend.hcl
```

Edit:

```text
terraform/backend.hcl
```

and replace:

```text
YOUR_TERRAFORM_STATE_BUCKET
```

with the name of the S3 bucket you created.

For example:

```hcl
bucket = "your-terraform-state-bucket"
key    = "terraform.tfstate"
region = "eu-west-1"

encrypt      = true
use_lockfile = true
```

The Terraform state bucket is separate from the application's frontend S3 bucket.

**Do not commit `backend.hcl`.**

The application resources themselves do not require manually assigned AWS names.

## 3. Deploy infrastructure

From the project root:

```bash
cd terraform

terraform init -backend-config=backend.hcl
terraform validate
terraform plan
terraform apply
```

Review the Terraform plan before approving the deployment.

### Automatic unique installation

During the deployment Terraform generates a unique installation ID automatically.

The installation ID is used as part of the resource naming convention:

```text
<project>-<environment>-<installation-id>-<resource>
```

For example:

```text
aws-saas-starter-kit-dev-a1b2c3d4-users
aws-saas-starter-kit-dev-a1b2c3d4-organizations
aws-saas-starter-kit-dev-a1b2c3d4-invitations
aws-saas-starter-kit-dev-a1b2c3d4-backend
aws-saas-starter-kit-dev-a1b2c3d4-api
```

The actual installation ID is generated automatically and will be different for another independent deployment.

**Do not manually rename these resources in the Terraform files.**

## 4. Get deployment values

After Terraform finishes:

```bash
terraform output
```

The outputs contain the values required by the frontend and deployment process.

Relevant outputs include:

* API Gateway URL
* Cognito User Pool ID
* Cognito Client ID
* Frontend S3 bucket
* CloudFront distribution ID
* CloudFront domain
* Backend Lambda name
* DynamoDB table names

Save these values for the frontend configuration.

## 5. Configure frontend

From the project root:

```bash
cd web
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_AWS_REGION=eu-west-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
```

Use the values returned by Terraform for **your installation**.

Do not copy these values from another deployment.

## 6. Build frontend

Inside `web/`:

```bash
npm ci
npm run lint
npm run build
```

The static frontend will be generated in:

```text
web/out/
```

## 7. Deploy frontend

Get your frontend bucket:

```bash
cd ../terraform
terraform output -raw frontend_bucket_name
```

Then return to the project root:

```bash
cd ..
```

Deploy the frontend:

```bash
aws s3 sync \
  web/out \
  s3://$(terraform -chdir=terraform output -raw frontend_bucket_name) \
  --delete
```

Get the CloudFront distribution ID:

```bash
terraform -chdir=terraform output -raw cloudfront_distribution_id
```

Then invalidate CloudFront:

```bash
aws cloudfront create-invalidation \
  --distribution-id "$(terraform -chdir=terraform output -raw cloudfront_distribution_id)" \
  --paths "/*"
```

## 8. Verify

Get the CloudFront domain:

```bash
terraform -chdir=terraform output -raw cloudfront_domain_name
```

Open the domain in your browser and verify the main SaaS flows:

* Registration
* Login
* Organization creation
* Members
* Invitations
* Role management
* Permission enforcement

A new installation is designed to use its own isolated application resources and data.

## 9. Backend tests

From the project root:

```bash
cd backend
npm ci
npm test
npm run build
```

If all tests pass and the backend builds successfully, the backend package has passed its local test and build checks.

## 10. Multiple installations

The starter kit can be deployed independently multiple times.

Each Terraform installation generates its own installation ID.

For example:

```text
Installation A
aws-saas-starter-kit-dev-a1b2c3d4-users
aws-saas-starter-kit-dev-a1b2c3d4-backend

Installation B
aws-saas-starter-kit-dev-f8e7d6c5-users
aws-saas-starter-kit-dev-f8e7d6c5-backend
```

Each installation is designed to use separate AWS resources and separate application data.

No manual renaming of the application's AWS resources is required.

## 11. GitHub Actions

For automated deployments, configure the repository secrets documented in:

```text
docs/INSTALLATION.md
```

Push to `main` to trigger the deployment workflow.

## Need help?

See:

```text
docs/INSTALLATION.md
```

The installation guide contains the complete deployment process and troubleshooting information.

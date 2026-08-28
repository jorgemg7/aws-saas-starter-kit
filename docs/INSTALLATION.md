# AWS SaaS Starter Kit — Installation Guide

This guide explains how to deploy the AWS SaaS Starter Kit from scratch in your own AWS account.

The starter kit provisions the application infrastructure using:

* AWS
* Terraform
* Amazon Cognito
* API Gateway
* AWS Lambda
* DynamoDB
* Amazon S3
* CloudFront
* IAM
* CloudWatch
* GitHub Actions
* Next.js

The infrastructure is designed for **independent installations**.

Each Terraform installation automatically generates a unique installation ID. This ID is included in the names of the application's AWS resources, allowing the same starter kit to be deployed multiple times without manually renaming the application resources.

---

## 1. Requirements

Before starting, install:

* Git
* Node.js 24+
* npm
* AWS CLI
* Terraform 1.13+
* An AWS account

Verify the tools:

```bash
git --version
node --version
npm --version
aws --version
terraform version
```

---

## 2. Configure AWS CLI

Configure credentials for the AWS account that will host the application:

```bash
aws configure
```

Verify access:

```bash
aws sts get-caller-identity
```

The command should return the AWS account and IAM identity being used.

Make sure the AWS identity has enough permissions to create the resources defined by Terraform.

---

## 3. Clone the repository

Clone the project and enter the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd aws-saas-starter-kit
```

If you received the project as a ZIP archive, extract it and enter the extracted project directory instead.

---

## 4. Configure the Terraform state

Terraform uses an S3 backend to store the infrastructure state.

Each independent installation should use its **own Terraform state**.

Create a dedicated S3 bucket in your AWS account for the Terraform state.

The bucket name must be globally unique.

Example:

```bash
aws s3api create-bucket \
  --bucket YOUR_UNIQUE_TERRAFORM_STATE_BUCKET \
  --region eu-west-1 \
  --create-bucket-configuration LocationConstraint=eu-west-1
```

Do not use the state bucket from the original development environment.

The Terraform state bucket is **not** the same bucket used by the application's frontend.

---

## 5. Configure the Terraform backend

Copy the example backend configuration:

```bash
cp terraform/backend.hcl.example terraform/backend.hcl
```

Edit:

```text
terraform/backend.hcl
```

Set the name of the state bucket you created:

```hcl
bucket = "YOUR_TERRAFORM_STATE_BUCKET"
key    = "terraform.tfstate"
region = "eu-west-1"

encrypt      = true
use_lockfile = true
```

The backend configuration is installation-specific.

**Do not commit `terraform/backend.hcl`.**

The repository already ignores this file.

### Important

If you deploy the starter kit more than once, use a separate Terraform state for each independent installation.

For example:

```text
Installation A
State bucket: customer-a-terraform-state
State key:    terraform.tfstate

Installation B
State bucket: customer-b-terraform-state
State key:    terraform.tfstate
```

This keeps Terraform state independent between installations.

---

## 6. Configure deployment variables

The starter kit provides default values for the main deployment variables:

```text
project_name
environment
aws_region
```

The default configuration can be used for a standard installation.

You do **not** need to manually rename the application's AWS resources.

Terraform automatically generates an installation ID during deployment.

The generated ID is incorporated into the resource naming convention:

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

The actual installation ID is generated automatically.

Another independent deployment will generate a different installation ID.

**Do not manually rename DynamoDB tables, Lambda functions, Cognito resources, API Gateway resources, IAM resources or CloudFront-related resources in the Terraform files.**

---

## 7. Initialize Terraform

Enter the Terraform directory:

```bash
cd terraform
```

Initialize Terraform using the installation-specific backend:

```bash
terraform init -backend-config=backend.hcl
```

Terraform will:

* configure the S3 remote state backend
* initialize the Terraform modules
* install the required providers
* prepare the working directory

If the backend configuration changes later, reinitialize Terraform:

```bash
terraform init -reconfigure -backend-config=backend.hcl
```

---

## 8. Validate Terraform

Run:

```bash
terraform fmt -check -recursive
terraform validate
```

The configuration should validate successfully.

The AWS provider may display deprecation warnings depending on the provider version.

Warnings do not necessarily prevent a successful validation.

---

## 9. Review the Terraform plan

Run:

```bash
terraform plan -input=false
```

Review the resources before applying them.

The infrastructure includes resources for:

* S3
* CloudFront
* Cognito
* API Gateway
* Lambda
* DynamoDB
* IAM
* CloudWatch
* Terraform installation identity

A new installation should show resources being created rather than attempting to modify resources belonging to another installation.

---

## 10. Deploy the infrastructure

When the plan has been reviewed:

```bash
terraform apply -input=false
```

Review the plan again and confirm the deployment when Terraform asks for confirmation.

Terraform will generate the installation ID automatically.

No manual resource renaming is required.

---

## 11. Verify the installation ID

After deployment:

```bash
terraform output
```

The outputs include the resources created for the installation.

You can also inspect the Terraform state:

```bash
terraform state list
```

The resource names returned by Terraform should correspond to the current installation.

The important point is that the installation receives its own resource naming namespace.

---

## 12. Get Terraform outputs

After deployment:

```bash
terraform output
```

Important outputs include:

```text
backend_api_url
backend_lambda_name
cloudfront_distribution_id
cloudfront_domain_name
cognito_client_id
cognito_user_pool_id
frontend_bucket_name
invitations_table_name
organizations_table_name
users_table_name
```

These values belong to **your installation**.

Do not copy deployment values from another installation.

---

## 13. Configure the frontend

Return to the project root:

```bash
cd ..
```

Create the local frontend environment file:

```bash
cp web/.env.example web/.env.local
```

Edit:

```bash
nano web/.env.local
```

Set the values returned by Terraform:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_AWS_REGION=eu-west-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
```

You can retrieve the individual values with:

```bash
terraform -chdir=terraform output -raw backend_api_url
terraform -chdir=terraform output -raw cognito_user_pool_id
terraform -chdir=terraform output -raw cognito_client_id
```

For example:

```env
NEXT_PUBLIC_API_URL=https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com
NEXT_PUBLIC_AWS_REGION=eu-west-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-1_xxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxx
```

The example values above are placeholders.

Use the values generated by **your Terraform installation**.

**Never commit `web/.env.local`.**

---

## 14. Install frontend dependencies

Enter the web directory:

```bash
cd web
```

Install dependencies:

```bash
npm ci
```

Run linting:

```bash
npm run lint
```

Build the frontend:

```bash
npm run build
```

The static export will be generated in:

```text
web/out/
```

---

## 15. Test the backend

From the project root:

```bash
cd backend
```

Install dependencies:

```bash
npm ci
```

Run the test suite:

```bash
npm test
```

Build the backend:

```bash
npm run build
```

The backend should pass all tests and compile successfully before deployment.

---

## 16. Deploy the frontend manually

The frontend is deployed to the S3 bucket created by Terraform.

From the project root, run:

```bash
aws s3 sync \
  web/out \
  s3://$(terraform -chdir=terraform output -raw frontend_bucket_name) \
  --delete
```

This uses the frontend bucket generated for the current Terraform installation.

No bucket name needs to be manually configured.

---

## 17. Invalidate CloudFront

After uploading the frontend, invalidate the CloudFront cache:

```bash
aws cloudfront create-invalidation \
  --distribution-id "$(terraform -chdir=terraform output -raw cloudfront_distribution_id)" \
  --paths "/*"
```

The distribution ID is obtained automatically from the current Terraform installation.

---

## 18. Open the application

Get the CloudFront domain:

```bash
terraform -chdir=terraform output -raw cloudfront_domain_name
```

Open the returned domain in your browser.

The application should load from the CloudFront distribution created by Terraform.

---

## 19. Verify the application

Verify the main SaaS flows:

* Frontend loads successfully
* User registration works
* User login works
* Cognito authentication works
* A new user receives an organization
* Organization members can be listed
* Authorized users can invite members
* Invitations can be accepted
* Member roles can be updated
* Unauthorized operations are rejected

The newly deployed installation should use its own application resources and data.

---

## 20. Multiple independent installations

The starter kit is designed to support independent deployments.

Each installation generates a different installation ID.

For example:

```text
Installation A

aws-saas-starter-kit-dev-a1b2c3d4-users
aws-saas-starter-kit-dev-a1b2c3d4-organizations
aws-saas-starter-kit-dev-a1b2c3d4-invitations
aws-saas-starter-kit-dev-a1b2c3d4-backend
aws-saas-starter-kit-dev-a1b2c3d4-api
```

Another installation may generate:

```text
Installation B

aws-saas-starter-kit-dev-f8e7d6c5-users
aws-saas-starter-kit-dev-f8e7d6c5-organizations
aws-saas-starter-kit-dev-f8e7d6c5-invitations
aws-saas-starter-kit-dev-f8e7d6c5-backend
aws-saas-starter-kit-dev-f8e7d6c5-api
```

The application resource names are therefore different even when the same template is used.

### Important

Each independent installation must also have its own Terraform state.

Do not point two independent installations at the same Terraform state unless you intentionally want them to represent the same infrastructure.

---

## 21. GitHub Actions deployment

The repository includes a GitHub Actions deployment workflow.

The workflow runs when changes are pushed to `main`.

The deployment workflow can:

* Install backend dependencies
* Run backend tests
* Build the backend
* Install frontend dependencies
* Run frontend linting
* Build the frontend
* Check Terraform formatting
* Validate Terraform
* Create a Terraform plan
* Apply the Terraform plan
* Upload the frontend to S3
* Invalidate CloudFront

The workflow uses AWS OIDC authentication instead of storing long-lived AWS access keys.

---

## 22. GitHub Actions secrets

Configure the repository secrets required by the deployment workflow.

The expected deployment configuration includes:

```text
AWS_DEPLOY_ROLE_ARN
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_AWS_REGION
NEXT_PUBLIC_COGNITO_USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID
FRONTEND_BUCKET_NAME
CLOUDFRONT_DISTRIBUTION_ID
```

The AWS-specific values can be obtained from Terraform:

```bash
terraform -chdir=terraform output -raw backend_api_url

terraform -chdir=terraform output -raw cognito_user_pool_id

terraform -chdir=terraform output -raw cognito_client_id

terraform -chdir=terraform output -raw frontend_bucket_name

terraform -chdir=terraform output -raw cloudfront_distribution_id
```

Use the outputs from the Terraform state belonging to the current installation.

---

## 23. AWS credentials for GitHub Actions

The recommended deployment flow is:

```text
GitHub Actions
      ↓
GitHub OIDC
      ↓
AWS IAM Role
      ↓
AWS resources
```

The workflow expects the ARN of the deployment role in:

```text
AWS_DEPLOY_ROLE_ARN
```

Do not store long-lived AWS access keys in GitHub repository secrets.

---

## 24. Environment files

The repository includes example environment files:

```text
backend/.env.example
web/.env.example
terraform/backend.hcl.example
```

These files are templates.

Do not commit installation-specific files such as:

```text
web/.env.local
terraform/backend.hcl
terraform.tfvars
*.tfstate
*.tfstate.*
```

The repository's `.gitignore` should protect these environment-specific files.

---

## 25. Troubleshooting

### Terraform cannot initialize the backend

Verify:

* The S3 state bucket exists.
* The bucket name is correct.
* The AWS region is correct.
* The AWS credentials are configured correctly.
* The AWS identity has access to the bucket.
* `terraform/backend.hcl` exists.

Check the file:

```bash
cat terraform/backend.hcl
```

Then reinitialize:

```bash
terraform -chdir=terraform init \
  -reconfigure \
  -backend-config=backend.hcl
```

---

### Terraform reports that the state bucket does not exist

The application frontend bucket is not the Terraform state bucket.

Make sure the bucket specified in:

```text
terraform/backend.hcl
```

was created before running:

```bash
terraform init -backend-config=backend.hcl
```

---

### Terraform reports missing providers

Run:

```bash
terraform -chdir=terraform init -upgrade
```

Then:

```bash
terraform -chdir=terraform validate
```

---

### Frontend build fails

Check:

```bash
cat web/.env.local
```

Make sure the required variables are populated:

```text
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_AWS_REGION
NEXT_PUBLIC_COGNITO_USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID
```

Make sure these values belong to the current AWS installation.

Then run:

```bash
cd web
npm ci
npm run lint
npm run build
```

---

### Backend tests fail

Run:

```bash
cd backend
npm ci
npm test
```

To rebuild:

```bash
npm run build
```

---

### CloudFront shows an old version

Create a new invalidation:

```bash
aws cloudfront create-invalidation \
  --distribution-id "$(terraform -chdir=terraform output -raw cloudfront_distribution_id)" \
  --paths "/*"
```

---

### "Resource already exists" errors

If Terraform reports that an application resource already exists, first verify that you are using the correct AWS account and Terraform state.

Check:

```bash
aws sts get-caller-identity
```

Then:

```bash
terraform -chdir=terraform state list
```

The application resources should belong to the current Terraform installation.

Do not manually rename existing resources unless you intentionally want to modify the infrastructure design.

---

## 26. Cleanup

To remove the infrastructure created by Terraform:

```bash
cd terraform
terraform destroy
```

Review the resources carefully before confirming.

The Terraform state bucket is separate from the application infrastructure.

Terraform will not automatically remove the state bucket.

If the bucket is no longer required, it can be removed separately after the Terraform infrastructure has been destroyed and the bucket contents have been handled appropriately.

---

## 27. Recommended deployment flow

For a new installation:

```text
AWS account
    ↓
AWS CLI configuration
    ↓
Create Terraform state bucket
    ↓
Configure backend.hcl
    ↓
terraform init
    ↓
terraform validate
    ↓
terraform plan
    ↓
terraform apply
    ↓
Automatic installation ID
    ↓
Terraform outputs
    ↓
Configure web/.env.local
    ↓
npm ci
    ↓
npm run lint
    ↓
npm run build
    ↓
Deploy frontend
    ↓
Invalidate CloudFront
    ↓
Verify application
    ↓
Configure GitHub Actions
    ↓
Automated deployments
```

---

## 28. Production considerations

Before using the starter kit for a production SaaS application, review:

* AWS IAM permissions
* Cognito configuration
* Domain configuration
* CloudFront configuration
* API security
* DynamoDB access patterns
* Monitoring and alerting
* Logging
* Backup and recovery
* Cost controls
* Environment separation
* Application-specific security requirements

The starter kit provides the technical foundation for a SaaS application.

Each production deployment should be reviewed according to its own architecture, security requirements, traffic profile and compliance requirements.

### Security roadmap

Additional production hardening can be added depending on the application and traffic profile, including:

* AWS WAF
* CloudFront security controls
* Rate limiting
* Enhanced logging and monitoring
* CloudWatch alarms
* AWS Shield protections where appropriate
* Additional IAM least-privilege controls
* Backup and recovery policies

These protections should be evaluated based on the application's actual production requirements and expected traffic.

---

## 29. Support and further documentation

For the shorter deployment procedure, see:

```text
docs/QUICKSTART.md
```

The Quick Start provides the fastest path from an AWS account to a running installation.

This installation guide provides the complete deployment process, configuration details and troubleshooting information.

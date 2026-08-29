# AWS SaaS Starter Kit — Installation Guide

This guide explains how to deploy the AWS SaaS Starter Kit as an independent installation.

The infrastructure is designed for **independent installations**.

Each Terraform installation automatically generates a unique installation ID when one is not explicitly provided. This ID is included in the names of the application's AWS resources, allowing the same starter kit to be deployed multiple times without manually renaming application resources.

Each independent installation must also use its **own Terraform state**.

---

## 1. Requirements

Before installing the starter kit, make sure the following tools are installed:

* AWS CLI
* Terraform >= 1.13
* Node.js 24 or compatible version
* npm
* Git

Verify the installations:

```bash
aws --version
terraform version
node --version
npm --version
git --version
```

You also need an AWS account with permissions to create the infrastructure defined by the Terraform configuration.

---

## 2. Configure AWS credentials

Configure the AWS CLI:

```bash
aws configure
```

Verify the active AWS identity:

```bash
aws sts get-caller-identity
```

Make sure the AWS account and credentials belong to the installation you intend to deploy.

The AWS region used by the default configuration is:

```text
eu-west-1
```

---

## 3. Clone the project

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

Set the name of the state bucket you created and choose a unique state key for this installation:

```hcl
bucket = "YOUR_TERRAFORM_STATE_BUCKET"
key    = "installations/YOUR_INSTALLATION_NAME/terraform.tfstate"
region = "eu-west-1"

encrypt      = true
use_lockfile = true
```

The backend configuration is installation-specific.

**Do not commit `terraform/backend.hcl`.**

The repository already ignores this file.

### Important

The Terraform state must be unique for every independent installation.

The `installation_id` used in the backend state key should match the `installation_id` used by Terraform when an explicit installation ID is configured.

For example:

```text
Installation A

installation_id = a1b2c3d4

State bucket: customer-terraform-state
State key:    installations/a1b2c3d4/terraform.tfstate
```

Another installation can use:

```text
Installation B

installation_id = f8e7d6c5

State bucket: customer-terraform-state
State key:    installations/f8e7d6c5/terraform.tfstate
```

Alternatively, separate state buckets can be used:

```text
Installation A
State bucket: customer-a-terraform-state
State key:    terraform.tfstate

Installation B
State bucket: customer-b-terraform-state
State key:    terraform.tfstate
```

Both approaches keep Terraform state independent.

**Never point two independent installations at the same Terraform state.**

The Terraform state bucket is separate from the application's frontend S3 bucket.

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

Terraform automatically generates an installation ID when `installation_id` is not provided.

For a reproducible installation, you can provide your own persistent installation ID:

```hcl
installation_id = "a1b2c3d4"
```

The installation ID must contain only lowercase letters, numbers and hyphens, and must be between 4 and 32 characters.

When using an explicit `installation_id`, use the same value in the Terraform backend state key:

```text
installations/a1b2c3d4/terraform.tfstate
```

The generated or provided installation ID is incorporated into the resource naming convention:

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

Another independent deployment can use a different installation ID.

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

## 8. Validate the Terraform configuration

Run:

```bash
terraform validate
```

You can also check formatting:

```bash
terraform fmt -check -recursive
```

If Terraform reports missing providers or modules, run:

```bash
terraform init -upgrade
```

and then:

```bash
terraform validate
```

---

## 9. Review the Terraform plan

Before creating infrastructure, run:

```bash
terraform plan -input=false
```

Review the resources that Terraform intends to create.

For a new independent installation, Terraform should create resources belonging to the current installation.

It should **not** attempt to destroy or modify resources belonging to another independent installation.

If using an explicit installation ID:

```bash
terraform plan \
  -input=false \
  -var='installation_id=a1b2c3d4'
```

The resulting resource names should contain the selected installation ID.

---

## 10. Deploy the infrastructure

Apply the Terraform configuration:

```bash
terraform apply
```

Review the proposed changes and confirm when Terraform asks for confirmation.

For automated environments:

```bash
terraform apply -input=false -auto-approve
```

Terraform creates the AWS infrastructure required by the application.

---

## 11. Verify the installation ID

After deployment, inspect the Terraform outputs:

```bash
terraform output
```

The outputs include the resources created for the installation.

For example:

```bash
terraform output -raw backend_lambda_name
terraform output -raw users_table_name
terraform output -raw organizations_table_name
terraform output -raw invitations_table_name
```

The resource names returned by Terraform should correspond to the current installation.

The important point is that the installation receives its own resource naming namespace.

---

## 12. Obtain application configuration

The frontend requires the API and Cognito configuration created by Terraform.

From the Terraform directory:

```bash
terraform output -raw backend_api_url
terraform output -raw cognito_user_pool_id
terraform output -raw cognito_client_id
```

Also obtain:

```bash
terraform output -raw frontend_bucket_name
terraform output -raw cloudfront_distribution_id
terraform output -raw cloudfront_domain_name
```

These values belong to **your installation**.

Do not copy deployment values from another installation.

---

## 13. Configure the frontend

Return to the repository root:

```bash
cd ..
```

Copy the environment template:

```bash
cp web/.env.example web/.env.local
```

Edit:

```text
web/.env.local
```

Set:

```text
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_AWS_REGION=eu-west-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
```

Populate the values using the Terraform outputs from the current installation.

Example:

```text
NEXT_PUBLIC_API_URL=https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com
NEXT_PUBLIC_AWS_REGION=eu-west-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-1_xxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxx
```

Do not commit `web/.env.local`.

---

## 14. Install frontend dependencies

Run:

```bash
cd web
npm ci
```

Then:

```bash
npm run lint
```

Build the frontend:

```bash
npm run build
```

The production build should complete successfully.

---

## 15. Install backend dependencies

Return to the backend directory:

```bash
cd ../backend
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

The backend tests should pass before deployment.

---

## 16. Deploy the frontend

Return to the repository root:

```bash
cd ..
```

Build the frontend:

```bash
cd web
npm run build
cd ..
```

Upload the generated static files to the frontend S3 bucket:

```bash
aws s3 sync \
  web/out \
  "s3://$(terraform -chdir=terraform output -raw frontend_bucket_name)" \
  --delete
```

The frontend bucket is generated for the current Terraform installation.

---

## 17. Invalidate CloudFront

After uploading a new frontend version, invalidate CloudFront:

```bash
aws cloudfront create-invalidation \
  --distribution-id "$(terraform -chdir=terraform output -raw cloudfront_distribution_id)" \
  --paths "/*"
```

Obtain the CloudFront domain:

```bash
terraform -chdir=terraform output -raw cloudfront_domain_name
```

Open the returned domain in a browser.

---

## 18. Verify AWS resources

Verify the main infrastructure created by Terraform:

```bash
terraform -chdir=terraform state list
```

The state should contain the resources for the current installation.

You can also verify the AWS identity:

```bash
aws sts get-caller-identity
```

and inspect the deployed resources through the AWS Console.

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

Each installation can use a different installation ID.

For example:

```text
Installation A

installation_id = a1b2c3d4

aws-saas-starter-kit-dev-a1b2c3d4-users
aws-saas-starter-kit-dev-a1b2c3d4-organizations
aws-saas-starter-kit-dev-a1b2c3d4-invitations
aws-saas-starter-kit-dev-a1b2c3d4-backend
aws-saas-starter-kit-dev-a1b2c3d4-api
```

Another installation can use:

```text
Installation B

installation_id = f8e7d6c5

aws-saas-starter-kit-dev-f8e7d6c5-users
aws-saas-starter-kit-dev-f8e7d6c5-organizations
aws-saas-starter-kit-dev-f8e7d6c5-invitations
aws-saas-starter-kit-dev-f8e7d6c5-backend
aws-saas-starter-kit-dev-f8e7d6c5-api
```

The application resource names are therefore different even when the same template is used.

Each installation must also use a separate Terraform state.

For example:

```text
Installation A
installation_id = a1b2c3d4
state key       = installations/a1b2c3d4/terraform.tfstate

Installation B
installation_id = f8e7d6c5
state key       = installations/f8e7d6c5/terraform.tfstate
```

The installation ID and Terraform state key work together:

* The installation ID separates the names of application resources.
* The Terraform state key separates Terraform's management state.

Changing only the installation ID while reusing another installation's state is **not** an independent deployment.

### Important

Each independent installation must have its own Terraform state.

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
* The state key is unique to the current installation.

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

Also verify that the current installation is using a unique `installation_id` and a unique Terraform state key.

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
Choose installation ID
    ↓
Configure unique backend state key
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

---

## Final checklist

Before considering an installation complete, verify:

```text
[ ] AWS credentials configured
[ ] Terraform state bucket created
[ ] Unique installation ID selected
[ ] Unique Terraform state key configured
[ ] terraform init completed
[ ] terraform validate passed
[ ] terraform plan reviewed
[ ] terraform apply completed
[ ] Terraform outputs collected
[ ] Frontend environment configured
[ ] Backend tests passed
[ ] Backend build passed
[ ] Frontend lint passed
[ ] Frontend build passed
[ ] Frontend uploaded to S3
[ ] CloudFront invalidated
[ ] Application verified
[ ] GitHub Actions configured
```

For multiple installations, verify additionally:

```text
[ ] Each installation has a unique installation ID
[ ] Each installation has a separate Terraform state
[ ] Resource names are isolated
[ ] Application data is isolated
[ ] No installation uses another installation's state
```

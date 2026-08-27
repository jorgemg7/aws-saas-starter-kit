# AWS SaaS Starter Kit — Quick Start

Get the starter kit running on your AWS account.

## Requirements

- AWS account
- AWS CLI
- Node.js 24+
- npm
- Terraform 1.13+

## 1. Configure AWS

Configure your AWS credentials:

```bash
aws configure
aws sts get-caller-identity
```

Make sure the returned account is the AWS account where you want to deploy the application.

## 2. Configure Terraform state

Create an S3 bucket in your AWS account for the Terraform remote state.

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

The file should contain values similar to:

```hcl
bucket = "your-terraform-state-bucket"
key    = "terraform.tfstate"
region = "eu-west-1"

encrypt      = true
use_lockfile = true
```

Do not commit `backend.hcl` if it contains environment-specific configuration.

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

## 4. Get deployment values

After Terraform finishes:

```bash
terraform output
```

Save the relevant values, including:

- API Gateway URL
- Cognito User Pool ID
- Cognito Client ID
- Frontend S3 bucket
- CloudFront distribution ID
- CloudFront domain

You will use these values to configure and deploy the frontend.

## 5. Configure frontend

From the project root:

```bash
cd web
cp .env.example .env.local
```

Edit `.env.local` and configure:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_AWS_REGION=eu-west-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
```

Use the values returned by Terraform for your AWS deployment.

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

From the project root:

```bash
aws s3 sync \
  web/out \
  s3://YOUR_FRONTEND_BUCKET \
  --delete
```

Then invalidate CloudFront:

```bash
aws cloudfront create-invalidation \
  --distribution-id "YOUR_CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"
```

Replace the placeholders with the values returned by Terraform.

## 8. Verify

Open the CloudFront domain and verify the main SaaS flows:

- Registration
- Login
- Organization creation
- Members
- Invitations
- Role management
- Permission enforcement

## 9. Backend tests

From the project root:

```bash
cd backend
npm ci
npm test
npm run build
```

If all tests pass and the backend builds successfully, the backend package has passed its local test and build checks.

## 10. GitHub Actions

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

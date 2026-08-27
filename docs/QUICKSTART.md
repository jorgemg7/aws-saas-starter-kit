# AWS SaaS Starter Kit — Quick Start

Get the starter kit running on your AWS account.

## Requirements

- AWS account
- AWS CLI
- Node.js 24+
- npm
- Terraform 1.13+

## 1. Configure AWS

```bash
aws configure
aws sts get-caller-identity
Make sure the returned account is the AWS account where you want to deploy the application.

2. Configure Terraform state

Create an S3 bucket for Terraform state.

Then:

cp terraform/backend.hcl.example terraform/backend.hcl

Edit terraform/backend.hcl and set your bucket name.

3. Deploy infrastructure
cd terraform

terraform init -backend-config=backend.hcl
terraform validate
terraform plan
terraform apply
4. Get deployment values
terraform output

Save these values:

API Gateway URL
Cognito User Pool ID
Cognito Client ID
Frontend S3 bucket
CloudFront distribution ID
CloudFront domain
5. Configure frontend
cd ../web
cp .env.example .env.local

Set:

NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_AWS_REGION=eu-west-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
6. Build frontend
npm ci
npm run lint
npm run build
7. Deploy frontend

From the project root:

aws s3 sync \
  web/out \
  s3://YOUR_FRONTEND_BUCKET \
  --delete

Then invalidate CloudFront:

aws cloudfront create-invalidation \
  --distribution-id "YOUR_CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"
8. Verify

Open the CloudFront domain and verify:

Registration
Login
Organization creation
Members
Invitations
Role management
Permission enforcement
9. Backend tests
cd backend
npm ci
npm test
npm run build

If all tests pass and the backend builds successfully, the backend is ready for deployment.

10. GitHub Actions

Configure the repository secrets documented in:

docs/INSTALLATION.md

Push to main to trigger the deployment workflow.

Need help?

Start with:

docs/INSTALLATION.md

The installation guide contains the complete deployment process and troubleshooting information.

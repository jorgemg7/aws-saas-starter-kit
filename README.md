# AWS SaaS Starter Kit

A production-ready foundation for building SaaS applications on AWS with Next.js, TypeScript, Terraform and serverless AWS services.

Designed to give developers a working SaaS foundation so they can focus on building their product instead of rebuilding authentication, organizations, permissions, invitations and AWS infrastructure from scratch.

---

## ✨ What's Included

### Authentication

- Amazon Cognito authentication
- User registration
- User login
- Email confirmation flow
- Authenticated frontend sessions
- Protected backend API

### Organizations

- Automatic organization creation for new users
- Organization ownership
- Organization membership
- Organization-scoped data access

### Roles & Permissions

Three built-in roles:

- `OWNER`
- `ADMIN`
- `MEMBER`

Permission-based authorization is handled in the backend.

Current permissions include:

- Read organization
- Update organization
- Read members
- Manage members
- Update member roles
- Delete organization

### Invitations

- Invite users by email
- Pending invitation management
- Invitation expiration
- Invitation acceptance
- Automatic membership creation after acceptance
- Protection against duplicate invitations
- Protection against accepting invitations for another email

### Team Management

- List organization members
- Add members through invitations
- Update member roles
- Owner protection

### AWS Infrastructure

Infrastructure is managed with Terraform.

The project includes:

- Amazon S3
- Amazon CloudFront
- Amazon Cognito
- API Gateway
- AWS Lambda
- DynamoDB
- IAM
- Terraform remote state

### CI/CD

GitHub Actions automates:

1. Backend dependency installation
2. Backend tests
3. Backend build
4. Frontend dependency installation
5. Frontend linting
6. Frontend build
7. Terraform formatting
8. Terraform validation
9. Terraform plan
10. Terraform apply
11. Frontend deployment to S3
12. CloudFront cache invalidation

---

## 🏗 Architecture

```text
                         ┌─────────────────┐
                         │     Browser     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   CloudFront    │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │       S3        │
                         │  Next.js static │
                         └─────────────────┘


                         API requests
                              │
                              ▼
                         ┌─────────────────┐
                         │   API Gateway   │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │     Lambda      │
                         │   TypeScript    │
                         └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              ┌──────────┐ ┌───────────┐ ┌───────────┐
              │ DynamoDB │ │  Cognito  │ │    IAM    │
              └──────────┘ └───────────┘ └───────────┘
📂 Project Structure
aws-saas-starter-kit/
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── handlers/
│   │   ├── http/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── tests/
│   ├── build.mjs
│   ├── package.json
│   └── tsconfig.json
│
├── terraform/
│   ├── modules/
│   ├── api_gateway.tf
│   ├── cognito.tf
│   ├── dynamodb.tf
│   ├── invitations.tf
│   ├── lambda.tf
│   ├── organizations.tf
│   ├── s3.tf
│   ├── cloudfront.tf
│   ├── iam.tf
│   ├── variables.tf
│   └── versions.tf
│
├── web/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── types/
│   ├── package.json
│   └── next.config.ts
│
├── docs/
├── .github/
├── .gitignore
├── CHANGELOG.md
├── LICENSE
└── README.md
🛠 Tech Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
AWS Amplify
React Hook Form
Zod
Backend
Node.js
TypeScript
AWS Lambda
AWS SDK
DynamoDB
Infrastructure
Terraform
Amazon S3
Amazon CloudFront
Amazon Cognito
API Gateway
DynamoDB
IAM
Development & CI
Git
GitHub Actions
ESLint
Vitest
🚀 Requirements

Before deploying the project, make sure you have:

Node.js 20+
npm
AWS account
AWS CLI
Terraform 1.13+
Git
GitHub repository

The AWS account must have permissions to create the resources defined in the Terraform configuration.

⚙️ Configuration

The project uses environment variables for AWS resource configuration.

Backend

The backend expects:

AWS_REGION
ENVIRONMENT
USERS_TABLE
INVITATIONS_TABLE
ORGANIZATIONS_TABLE
Frontend

The frontend expects the public configuration required by Next.js and Amazon Cognito:

NEXT_PUBLIC_API_URL
NEXT_PUBLIC_AWS_REGION
NEXT_PUBLIC_COGNITO_USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID

Do not commit real credentials or environment-specific secrets.

🏗 Infrastructure Deployment

Terraform is responsible for provisioning the AWS infrastructure.

From the terraform/ directory:

terraform init
terraform validate
terraform plan
terraform apply

Terraform creates and manages the AWS infrastructure required by the application.

💻 Local Development
Backend
cd backend

npm ci
npm run build
npm test

Run the test suite with:

npm test
Frontend
cd web

npm ci
npm run dev

For production builds:

npm run lint
npm run build
🧪 Testing

The backend uses Vitest.

Tests cover areas including:

Authentication and authorization
Roles and permissions
API handlers
Routes
Repositories
Organization services
User services
Invitation services
Member services

Run all backend tests with:

cd backend
npm test
🔐 Security

The backend enforces authorization using roles and permissions.

Organization-related operations are scoped to the authenticated user's organization.

The application also validates:

Cognito authentication claims
Invitation ownership
Invitation status
Invitation expiration
Organization membership
Protected owner role

Never commit:

AWS credentials
.env.local
Terraform state
Terraform variable files containing secrets
Generated deployment artifacts
🔄 CI/CD

The GitHub Actions workflow runs on pushes to main.

The deployment pipeline performs validation before infrastructure and frontend deployment.

Git push
   │
   ▼
GitHub Actions
   │
   ├── Backend tests
   ├── Backend build
   ├── Frontend lint
   ├── Frontend build
   ├── Terraform format
   ├── Terraform validate
   ├── Terraform plan
   ├── Terraform apply
   │
   ├── S3 deployment
   └── CloudFront invalidation
📈 Project Status

The project currently provides a working SaaS foundation with:

Authentication
Organizations
Role-based permissions
Team management
Invitations
AWS infrastructure
Automated tests
CI/CD

The project is being prepared as a reusable SaaS starter template.

🗺 Roadmap

Planned improvements include:

Production-ready documentation
Guided deployment instructions
Environment configuration templates
Additional integration tests
Improved error handling
Additional SaaS foundation features
Commercial packaging
📄 License

MIT

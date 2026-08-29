# Changelog

All notable changes to the AWS SaaS Starter Kit are documented here.

## [1.2.1] - 2026-08-29

### Changed

* Updated the changelog to document the commercial release history.
* Documented independent installations with unique resource naming.
* Added support for a persistent `installation_id` for reproducible deployments.
* Added support for `legacy_naming` for existing installations.
* Expanded installation, deployment and troubleshooting documentation.
* Cleaned development-only artifacts from the commercial release package.

### Validation

The release has been validated with:

* Backend tests passing: 88 tests.
* Backend production build passing.
* Frontend lint passing.
* Frontend production build passing.
* Terraform formatting validation passing.
* Terraform configuration validation passing.
* Clean release clone verified.
* Commercial package verified without Terraform state, local environment files, build artifacts or dependency directories.

### Notes

Terraform currently reports a provider deprecation warning for the
`hash_key` argument used by the DynamoDB table resource. The configuration
remains valid and deployable with the current provider configuration.

Each independent installation must use its own Terraform state and its own
installation namespace.

This release provides a technical starter foundation for SaaS applications.
Application-specific security, IAM, domain, monitoring, backup, cost and
production requirements must be reviewed before production use.

## [1.0.0] - 2026-08-27

### Added

* AWS infrastructure managed with Terraform.
* Static Next.js frontend hosted on Amazon S3.
* CloudFront distribution for frontend delivery.
* Amazon Cognito authentication.
* API Gateway HTTP API.
* AWS Lambda backend.
* DynamoDB persistence for users, organizations and invitations.
* Organization and member management.
* Role-based access control with OWNER, ADMIN and MEMBER roles.
* Organization invitations with expiration and acceptance flow.
* Backend automated tests with Vitest.
* Backend production build.
* Frontend linting and production build.
* GitHub Actions deployment workflow.
* Terraform validation and formatting checks.
* Quick start deployment documentation.
* Full installation and production considerations documentation.

### Validation

The release has been validated with:

* Backend tests passing.
* Backend build passing.
* Frontend lint passing.
* Frontend build passing.
* Terraform formatting validation passing.
* Terraform configuration validation passing.

### Notes

Terraform currently reports a provider deprecation warning for the
`hash_key` argument used by the DynamoDB table resource. The configuration
remains valid and deployable with the current provider configuration.

This release provides a technical starter foundation for SaaS applications.
Application-specific security, IAM, domain, monitoring, backup, cost and
production requirements must be reviewed before production use.


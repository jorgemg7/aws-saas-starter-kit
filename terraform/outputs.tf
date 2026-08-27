output "frontend_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.frontend.bucket
}

output "frontend_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.frontend.arn
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  description = "Cognito User Pool client ID"
  value       = aws_cognito_user_pool_client.web.id
}

output "backend_api_url" {
  description = "Backend API Gateway URL"
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "backend_lambda_name" {
  description = "Backend Lambda name"
  value       = aws_lambda_function.backend.function_name
}

output "users_table_name" {
  description = "DynamoDB users table name"
  value       = aws_dynamodb_table.users.name
}

output "invitations_table_name" {
  description = "DynamoDB invitations table name"
  value       = aws_dynamodb_table.invitations.name
}

output "organizations_table_name" {
  description = "DynamoDB organizations table name"
  value       = aws_dynamodb_table.organizations.name
}

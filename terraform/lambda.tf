data "archive_file" "backend_lambda" {
  type = "zip"

  source_file = "../backend/dist/index.js"

  output_path = "../backend/lambda.zip"
}

resource "aws_lambda_function" "backend" {

  function_name = "${var.project_name}-${var.environment}-backend"

  role = aws_iam_role.backend_lambda.arn

  filename = data.archive_file.backend_lambda.output_path

  source_code_hash = data.archive_file.backend_lambda.output_base64sha256

  runtime = "nodejs20.x"

  handler = "index.handler"

  architectures = [
    "x86_64"
  ]

  timeout = 30

  memory_size = 256

  environment {

    variables = {

      ENVIRONMENT = var.environment

      USERS_TABLE = aws_dynamodb_table.users.name

      ORGANIZATIONS_TABLE = aws_dynamodb_table.organizations.name

    }
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "backend_lambda" {

  name = "/aws/lambda/${aws_lambda_function.backend.function_name}"

  retention_in_days = 14

  tags = local.common_tags
}

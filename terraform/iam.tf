resource "aws_iam_role" "backend_lambda" {
  name = "${local.resource_prefix}-backend-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "lambda.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role = aws_iam_role.backend_lambda.name

  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "backend_dynamodb" {
  name = "${local.resource_prefix}-backend-dynamodb"

  role = aws_iam_role.backend_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]

        Resource = [
          aws_dynamodb_table.users.arn,
          "${aws_dynamodb_table.users.arn}/index/*",

          aws_dynamodb_table.organizations.arn,
          "${aws_dynamodb_table.organizations.arn}/index/*",

          aws_dynamodb_table.invitations.arn,
          "${aws_dynamodb_table.invitations.arn}/index/*"

        ]
      }
    ]
  })
}

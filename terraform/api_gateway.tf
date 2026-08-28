resource "aws_apigatewayv2_api" "backend" {

  name = "${local.resource_prefix}-api"

  protocol_type = "HTTP"

  cors_configuration {

    allow_origins = [
      "*"
    ]

    allow_methods = [
      "GET",
      "POST",
      "PUT",
      "OPTIONS"
    ]

    allow_headers = [
      "Authorization",
      "Content-Type"
    ]
  }

  tags = local.common_tags
}


resource "aws_apigatewayv2_authorizer" "cognito" {

  api_id = aws_apigatewayv2_api.backend.id

  authorizer_type = "JWT"

  name = "cognito-authorizer"

  identity_sources = [
    "$request.header.Authorization"
  ]

  jwt_configuration {

    audience = [
      aws_cognito_user_pool_client.web.id
    ]

    issuer = "https://${aws_cognito_user_pool.main.endpoint}"
  }
}


resource "aws_apigatewayv2_integration" "backend" {

  api_id = aws_apigatewayv2_api.backend.id

  integration_type = "AWS_PROXY"

  integration_uri = aws_lambda_function.backend.invoke_arn

  payload_format_version = "2.0"
}


resource "aws_apigatewayv2_route" "me" {

  api_id = aws_apigatewayv2_api.backend.id

  route_key = "GET /me"

  target = "integrations/${aws_apigatewayv2_integration.backend.id}"

  authorizer_id = aws_apigatewayv2_authorizer.cognito.id

  authorization_type = "JWT"
}


resource "aws_apigatewayv2_route" "organization" {

  api_id = aws_apigatewayv2_api.backend.id

  route_key = "GET /organization"

  target = "integrations/${aws_apigatewayv2_integration.backend.id}"

  authorizer_id = aws_apigatewayv2_authorizer.cognito.id

  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "members" {
  api_id = aws_apigatewayv2_api.backend.id

  route_key = "GET /members"

  target = "integrations/${aws_apigatewayv2_integration.backend.id}"

  authorizer_id = aws_apigatewayv2_authorizer.cognito.id

  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "members_post" {
  api_id = aws_apigatewayv2_api.backend.id

  route_key = "POST /members"

  target = "integrations/${aws_apigatewayv2_integration.backend.id}"

  authorizer_id = aws_apigatewayv2_authorizer.cognito.id

  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "invitations_accept" {
  api_id = aws_apigatewayv2_api.backend.id

  route_key = "POST /invitations/accept"

  target = "integrations/${aws_apigatewayv2_integration.backend.id}"

  authorizer_id = aws_apigatewayv2_authorizer.cognito.id

  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "invitations" {
  api_id = aws_apigatewayv2_api.backend.id

  route_key = "GET /invitations"

  target = "integrations/${aws_apigatewayv2_integration.backend.id}"

  authorizer_id = aws_apigatewayv2_authorizer.cognito.id

  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "members_role" {
  api_id = aws_apigatewayv2_api.backend.id

  route_key = "PUT /members/{id}/role"

  target = "integrations/${aws_apigatewayv2_integration.backend.id}"

  authorizer_id = aws_apigatewayv2_authorizer.cognito.id

  authorization_type = "JWT"
}

resource "aws_apigatewayv2_stage" "default" {

  api_id = aws_apigatewayv2_api.backend.id

  name = "$default"

  auto_deploy = true
}


resource "aws_lambda_permission" "api_gateway" {

  statement_id = "AllowAPIGatewayInvoke"

  action = "lambda:InvokeFunction"

  function_name = aws_lambda_function.backend.function_name

  principal = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.backend.execution_arn}/*/*"
}

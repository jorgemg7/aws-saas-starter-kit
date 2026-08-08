resource "aws_dynamodb_table" "organizations" {

  name = "${var.project_name}-${var.environment}-organizations"

  billing_mode = "PAY_PER_REQUEST"

  hash_key = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = local.common_tags
}

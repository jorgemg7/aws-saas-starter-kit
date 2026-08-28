resource "aws_dynamodb_table" "organizations" {

  name = "${local.resource_prefix}-organizations"

  billing_mode = "PAY_PER_REQUEST"

  hash_key = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = local.common_tags
}

resource "aws_s3_bucket" "frontend" {
  bucket = "aws-saas-starter-kit-567251176387"

  tags = {
    Name = "Frontend Bucket"
  }
}

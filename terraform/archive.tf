data "archive_file" "backend" {
  type        = "zip"
  source_file = "../backend/dist/index.js"
  output_path = "../backend/lambda.zip"
}

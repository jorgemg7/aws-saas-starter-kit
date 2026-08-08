resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.project_name}-oac"
  description                       = "OAC for S3 frontend bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}


resource "aws_cloudfront_distribution" "frontend" {

  enabled = true

  comment = "${var.project_name} frontend distribution"

  default_root_object = "index.html"


  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "s3-${aws_s3_bucket.frontend.id}"

    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }


  default_cache_behavior {

    allowed_methods = [
      "GET",
      "HEAD"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    target_origin_id = "s3-${aws_s3_bucket.frontend.id}"


    viewer_protocol_policy = "redirect-to-https"


    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }


    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }


  price_class = "PriceClass_100"


  restrictions {

    geo_restriction {
      restriction_type = "none"
    }

  }


  viewer_certificate {

    cloudfront_default_certificate = true

  }


  tags = local.common_tags
}

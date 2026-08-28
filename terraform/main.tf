module "backend" {

  source = "./modules/backend"

  project_name    = var.project_name
  environment     = var.environment
  aws_region      = var.aws_region
  installation_id = local.installation_id

}

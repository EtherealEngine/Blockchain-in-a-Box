variable "region" {
  default     = "us-west-1"
  description = "AWS region"
}

provider "aws" {
  region = "us-west-1"
}

data "aws_availability_zones" "available" {}

locals {
  cluster_name = "blockchain-prod-eks-${random_string.suffix.result}"
}

resource "random_string" "suffix" {
  length  = 8
  special = false
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "2.66.0"

  name                 = "blockchain-prod-vpc"
  cidr                 = "10.10.0.0/16"
  azs                  = data.aws_availability_zones.available.names
  private_subnets      = ["10.10.1.0/24", "10.10.2.0/24", "10.10.3.0/24"]
  public_subnets       = ["10.10.4.0/24", "10.10.5.0/24", "10.10.6.0/24"]
  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true
  map_public_ip_on_launch = true
  
  tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
  }

  public_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                      = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"             = "1"
  }
}

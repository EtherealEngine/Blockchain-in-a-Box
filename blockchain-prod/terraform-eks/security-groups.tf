resource "aws_security_group" "redis" {
  name       = "blockchain-prod-redis-security-group"
  description = "subnet where redis will live"
  vpc_id      = module.vpc.vpc_id
  ingress {
    from_port = 6379
    to_port   = 6379
    protocol  = "tcp"

    cidr_blocks = [
      "0.0.0.0/0",
	  "10.10.0.0/24",
	  "192.168.0.0/16"
    ]
  }
  tags = {
    Environment = "blockchain-prod"}
}

resource "aws_security_group" "blockchain_prod_worker_group_mgmt_one" {
  name_prefix = "blockchain_prod_worker_group_mgmt_one"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"

    cidr_blocks = [
      "10.10.0.0/24",
    ]
  }
  tags = {
    Environment = "blockchain-prod"}
}

resource "aws_security_group" "blockchain_prod_worker_group_mgmt_two" {
  name_prefix = "blockchain_prod_worker_group_mgmt_two"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"

    cidr_blocks = [
      "192.168.0.0/16",
    ]
  }
  tags = {
    Environment = "blockchain-prod"}
}

resource "aws_security_group" "blockchain-prod-all_worker_mgmt" {
  name_prefix = "blockchain-prod-all_worker_management"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"

    cidr_blocks = [
      "10.10.0.0/24",
      "172.16.0.0/12",
      "192.168.0.0/16",
    ]
  }
  tags = {
    Environment = "blockchain-prod"}
}

resource "aws_db_subnet_group" "blockchain-prod" {
  name       = "blockchain-prod"
  subnet_ids = module.vpc.public_subnets

  tags = {
    Name = "blockchain-prod"
  }
}

variable "db_password" {
  description = "RDS root user password"
  sensitive   = true
  default = "Admin123#"
}

resource "aws_security_group" "rds" {
  name   = "blockchain-prod_rds"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "blockchain-prod"
  }
}

resource "aws_rds_cluster" "blockchain-prod" {
  cluster_identifier     = "blockchain-prod-main"
  engine                 = "aurora-mysql"
  engine_version         = "5.7.mysql_aurora.2.10.0"
  master_username               = "admin"
  master_password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.blockchain-prod.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot    = true
  apply_immediately		 = true
  backup_retention_period = 1
}

resource "aws_rds_cluster_instance" "blockchain-prod" {
  count              = 1
  identifier         = "blockchain-prod-${count.index}"
  cluster_identifier = aws_rds_cluster.blockchain-prod.id
  instance_class     = "db.t3.small"
  publicly_accessible = true
  engine             = aws_rds_cluster.blockchain-prod.engine
  engine_version     = aws_rds_cluster.blockchain-prod.engine_version
}
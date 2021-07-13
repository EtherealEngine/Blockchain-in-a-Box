variable "cluster_id" {
  description = "Id to assign the new cluster"
  default = "blockchain-prod-cache"
}

variable "node_groups" {
  description = "Number of nodes groups to create in the cluster"
  default     = 1
}

resource "aws_subnet" "redis" {
  vpc_id            = module.vpc.vpc_id
  cidr_block        = "10.10.7.0/24"
  availability_zone = "us-west-1b"

  tags = {
    Environment = "blockchain-prod-redis-public"}
}

variable "redis_node_groups" {
  description = "Number of nodes groups to create in the cluster"
  default     = 3
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "vpc-public-blockchain-prod-redis-subnet-group"
  description = "subnet where redis will live"
  subnet_ids = [aws_subnet.redis.id]
}

resource "aws_elasticache_replication_group" "blockchain-prod" {
  replication_group_id          = "${var.cluster_id}"
  replication_group_description = "blockchain-prod-Redis"

  node_type            = "cache.t3.small"
  port                 = 6379
  parameter_group_name = "default.redis6.x.cluster.on"

  snapshot_retention_limit = 5
  snapshot_window          = "00:00-05:00"

  subnet_group_name          = "${aws_elasticache_subnet_group.redis.name}"
  automatic_failover_enabled = true
  security_group_ids = ["${aws_security_group.redis.id}"]
  cluster_mode {
    replicas_per_node_group = 1
    num_node_groups         = "${var.node_groups}"
  }
}
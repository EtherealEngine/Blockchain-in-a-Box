resource "aws_elasticache_cluster" "example" {
  cluster_id           = "ethereum-cache-example"
  engine               = "redis"
  node_type            = "cache.t2.micro"
  num_cache_nodes      = 2
  parameter_group_name = "default.redis6.x"
  engine_version       = "6.0.5"
  port                 = 6379
  security_group_ids   = module.eks.cluster_security_group_id
}
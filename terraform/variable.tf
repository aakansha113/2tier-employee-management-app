variable "aws_region" {
  description = "AWS Region"
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 Instance Type"
  default     = "t2.medium"
}

variable "ami_id" {
  description = "Ubuntu AMI ID"
  default     = "ami-0f918f7e67a3323f0"
}

variable "create_key_pair" {
  description = "Create a new key pair or use existing one"
  type        = bool
  default     = false
}

# ---------------- VPC ----------------

resource "aws_vpc" "employee_vpc" {
  count      = var.create_vpc ? 1 : 0
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "employee-vpc"
  }
}

data "aws_vpc" "existing_vpc" {
  count = var.create_vpc ? 0 : 1

  filter {
    name   = "tag:Name"
    values = [var.existing_vpc_name]
  }
}

# ---------------- Public Subnet ----------------

resource "aws_subnet" "employee_public_subnet" {
  vpc_id                  = local.vpc_id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "employee-public-subnet"
  }
}

# ---------------- Internet Gateway ----------------

resource "aws_internet_gateway" "employee_igw" {
  vpc_id = local.vpc_id

  tags = {
    Name = "employee-igw"
  }
}

# ---------------- Route Table ----------------

resource "aws_route_table" "employee_route_table" {
  vpc_id = local.vpc_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.employee_igw.id
  }

  tags = {
    Name = "employee-route-table"
  }
}

# ---------------- Route Table Association ----------------

resource "aws_route_table_association" "employee_rta" {
  subnet_id      = aws_subnet.employee_public_subnet.id
  route_table_id = aws_route_table.employee_route_table.id
}

# ---------------- Security Group ----------------

resource "aws_security_group" "employee_sg" {
  name   = "employee-app-sg"
  vpc_id = local.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 30007
    to_port     = 30007
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 9000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "employee-sg"
  }
}

# ---------------- Key Pair ----------------

resource "aws_key_pair" "employee_key" {
  count      = var.create_key_pair ? 1 : 0
  key_name   = "employees-key"
  public_key = file("employees.pub")
}

data "aws_key_pair" "existing_key" {
  count    = var.create_key_pair ? 0 : 1
  key_name = "employees-key"
}

# ---------------- Locals ----------------

locals {
  vpc_id   = var.create_vpc ? aws_vpc.employee_vpc[0].id : data.aws_vpc.existing_vpc[0].id
  key_name = var.create_key_pair ? aws_key_pair.employee_key[0].key_name : data.aws_key_pair.existing_key[0].key_name
}

# ---------------- EC2 ----------------

resource "aws_instance" "employee_app" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.employee_public_subnet.id
  vpc_security_group_ids = [aws_security_group.employee_sg.id]

  key_name = local.key_name

  user_data = file("script.sh")

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = "Employee-App-Server"
  }
}

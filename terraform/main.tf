# ---------------- VPC ----------------

resource "aws_vpc" "employee_vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "employee-vpc"
  }
}

# ---------------- Public Subnet ----------------

resource "aws_subnet" "employee_public_subnet" {
  vpc_id                  = aws_vpc.employee_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "employee-public-subnet"
  }
}

# ---------------- Internet Gateway ----------------

resource "aws_internet_gateway" "employee_igw" {
  vpc_id = aws_vpc.employee_vpc.id

  tags = {
    Name = "employee-igw"
  }
}

# ---------------- Route Table ----------------

resource "aws_route_table" "employee_route_table" {
  vpc_id = aws_vpc.employee_vpc.id

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
  vpc_id = aws_vpc.employee_vpc.id

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
    from_port   = 80
    to_port     = 80
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
  key_name   = "employees-key"
  public_key = file("employees.pub")
}
# ---------------- EC2 ----------------

resource "aws_instance" "employee_app" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.employee_public_subnet.id
  vpc_security_group_ids = [aws_security_group.employee_sg.id]

  key_name = aws_key_pair.employee_key.key_name

  user_data = file("script.sh")

  tags = {
    Name = "Employee-App-Server"
  }
}
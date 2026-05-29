output "instance_public_ip" {
  value = aws_instance.employee_app.public_ip
}

output "instance_public_dns" {
  value = aws_instance.employee_app.public_dns
}

output "instance_id" {
  value = aws_instance.employee_app.id
}
#!/bin/bash

# ---------------- System Update ----------------

sudo apt update -y

# ---------------- Disable Swap ----------------

sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab

# ---------------- Install Docker ----------------

sudo apt install -y docker.io

sudo systemctl enable docker
sudo systemctl start docker

sudo usermod -aG docker ubuntu

# ---------------- Install containerd ----------------

sudo apt install -y containerd

sudo mkdir -p /etc/containerd

containerd config default | sudo tee /etc/containerd/config.toml

# ---------------- Configure SystemdCgroup ----------------

sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

sudo systemctl restart containerd
sudo systemctl enable containerd

# ---------------- Required Packages ----------------

sudo apt install -y apt-transport-https ca-certificates curl gpg

# ---------------- Kubernetes Repository ----------------

sudo mkdir -p -m 755 /etc/apt/keyrings

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | \
sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | \
sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt update -y

# ---------------- Install Kubernetes ----------------

sudo apt install -y kubelet kubeadm kubectl

sudo apt-mark hold kubelet kubeadm kubectl

sudo systemctl enable kubelet
sudo systemctl start kubelet

# ---------------- Initialize Kubernetes Cluster ----------------

sudo kubeadm init --pod-network-cidr=192.168.0.0/16

# ---------------- Configure kubectl for ubuntu user ----------------

mkdir -p /home/ubuntu/.kube

sudo cp -i /etc/kubernetes/admin.conf /home/ubuntu/.kube/config

sudo chown ubuntu:ubuntu /home/ubuntu/.kube/config

# ---------------- Install Calico Network Plugin ----------------

su - ubuntu -c "kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.4/manifests/calico.yaml"
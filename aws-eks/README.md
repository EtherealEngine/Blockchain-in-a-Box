**Prerequisite Software**
1. aws cli
2. git
3. docker
4. kubectl
5. minikube
6. infura app

Example windows 
install choco
install choce terraform
install choco git
install choco kubectl
install docker
choco install minikube
https://infra.app/

**Step 1**
Setup AWS key in local system

aws configure

**Step 2**
Go to installer folder

cd C:\Onedrive\Work\LagunaLabs\aws-eks

**Step 3**
To initialize terraform scripts

terraform init

**Step 4**
To apply terraform scripts

terraform apply

**Step 5**
Once setup done then apply in kubectl

aws eks --region us-west-1 update-kubeconfig --name <aws eks name>

**Step 6**
Check details with infura app for details also can get details in AWS login.

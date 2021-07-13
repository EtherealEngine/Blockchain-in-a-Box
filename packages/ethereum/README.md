# Go-Ethereum and Services
This repo compains Kubernetes configuration and Docker files for deploying Geth and related services.

## AWS EKS Setup
https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html
https://docs.aws.amazon.com/eks/latest/userguide/metrics-server.html
https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html

To get started with EKS:
```
aws eks --region us-west-1 update-kubeconfig --name AWS EKS name
```

**Step 1: Go to installer folder**
```
cd ethereum
```

**Step 2: Apply the setup script**
```
kubectl apply -f geth-config.yml -f geth-svc.yml -f geth-ds.yml -f geth-ethnetintel-ds.yml -f ethstats-dashboard-dp.yml -f remix-dp.yml -f remix-loadbalancer.yml -f ethstats-dashboard-loadbalancer.yml -f ethstats-dashboard-loadbalancer.yml -f geth-loadbalancer.yml -f blockchain-api.yml -f blockchain-api-loadbalancer.yml
```

**Step 3: Test commands**

Get pod and services
```
kubectl get po,svc -o wide
```

Check events
```
kubectl get events
```

Get logs
```
kubectl logs pod/geth-htkl5 -c init-genesis
kubectl logs pod/geth-p7gjv -c geth-ethnetintel
```

You can also check using [infra](https://infra.app/). 

```
ethstats-dashboard: http://ethstats-dashboard-loadbalancer/

remix ide browser: http://remix-loadbalancer

geth: http://geth-loadbalancer/

blockchain-api: http://blockchain-api-loadbalancer/
```

### Additional Configuration Notes
These are the engineer's raw notes, in case anything is missing from above
```
aws configure 
Step 1
install choco
install choce terraform
install choco git
install choco kubectl
install docker
choco install minikube
```

Ubuntu   
```
https://www.microsoft.com/en-in/p/ubuntu-1804-lts/9n9tngvndl3q?rtc=1#activetab=pivot:overviewtab
https://www.catalog.update.microsoft.com/Search.aspx?q=wsl
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
wsl --set-default-version 2
https://www.catalog.update.microsoft.com/Search.aspx?q=wsl
docker run -d -p 8080:8080 docker/getting-started
```
```
choco install minikube
minikube start
```

Step 2
```
cd C:\terraform\terraform-helm-eks
c:\terraform\terraform apply
```

Step 3
```
aws eks --region us-west-1 update-kubeconfig --name kubereum-eks-rFcN8iQa
kubectl apply -f metrics-server-0.3.6/deploy/1.8+/
kubectl get deployment metrics-server -n kube-system
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0-beta8/aio/deploy/recommended.yaml
kubectl proxy
dashboard http://127.0.0.1:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```

Step 4

```
kubectl apply -f https://raw.githubusercontent.com/hashicorp/learn-terraform-provision-eks-cluster/master/kubernetes-dashboard-admin.rbac.yaml

kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep service-controller-token | awk '{print $1}')

kubectl apply -f geth-config.yml -f geth-svc.yml -f geth-ds.yml -f geth-ethnetintel-ds.yml -f ethstats-dashboard-dp.yml -f remix-dp.yml -f remix-loadbalancer.yml -f ethstats-dashboard-loadbalancer.yml -f ethstats-dashboard-loadbalancer.yml -f geth-loadbalancer.yml -f blockchain-api.yml -f blockchain-api-loadbalancer.yml

kubectl get po,svc -o wide

kubectl get pods

kubectl get events

kubectl logs pod/geth-htkl5 -c init-genesis

kubectl logs pod/geth-p7gjv -c geth-ethnetintel
```

Using https://infra.app/
```
ethstat
http://<ethstat-loadbalancer>:3000/
solidity browser
http://<solidity-loadbalancer>
geth
http://<geth-loadbalancer>:8545/
```

## Local Setup

NOTE: You will need [minikube](https://v1-18.docs.kubernetes.io/docs/tasks/tools/install-minikube/) installed to run locally.

**Set up and verify Minikube is working**
```
minikube start

minikube ip

minikube dashboard

kubectl config use-context minikube

kubectl cluster-info

minikube service list
```

**Step 1: Go to installer folder**

cd kubereum-master

**Step 2: Apply the different setup script**

kubectl apply -f geth-config.yml -f geth-svc.yml -f geth-ds.yml -f geth-ethnetintel-ds.yml -f ethstats-dashboard-dp.yml -f remix-dp.yml -f remix-loadbalancer.yml -f ethstats-dashboard-loadbalancer.yml -f ethstats-dashboard-loadbalancer.yml -f geth-loadbalancer.yml -f blockchain-api.yml -f blockchain-api-loadbalancer.yml

**Step 3: Test**

Test multiple command after set

Get pod and services
```
kubectl get po,svc -o wide
```

Check events
```
kubectl get events
```

Get logs
```
kubectl logs pod/geth-htkl5 -c init-genesis
kubectl logs pod/geth-p7gjv -c geth-ethnetintel
```

**Step 4: Making Minikube accessible**
```
minikube tunnel
```

You can also check using [infra](https://infra.app/). 

Please change port in script for local setup, otherwise it will conflict each other.
```
ethstats-dashboard http://127.0.0.1:3000/

solidity browser http://127.0.0.1

geth http://127.0.0.1:8545/

blockchain api http://127.0.0.1:8080/
```

### Additional Notes
**These are the engineer's raw notes**
Windows Installation
```
choco install openssh

minikube delete
minikube start
minikube ip
minikube dashboard
kubectl cluster-info
minikube service list
kubectl config use-context minikube

kubectl apply -f geth-config.yml -f geth-svc.yml -f geth-ds.yml -f geth-ethnetintel-ds.yml -f ethstats-dashboard-dp.yml -f remix-dp.yml -f remix-loadbalancer.yml -f ethstats-dashboard-loadbalancer.yml -f ethstats-dashboard-loadbalancer.yml -f geth-loadbalancer.yml -f blockchain-api.yml -f blockchain-api-loadbalancer.yml

minikube tunnel

ethstat
http://127.0.0.1:3000/
solidity browser
http://127.0.0.1
geth
http://127.0.0.1:8545/


Troubleshooting

kubectl cluster-info

minikube start
```
**For AWS EKS setup**
Set AWS EKS with kubectl

aws eks --region us-west-1 update-kubeconfig --name AWS EKS name
 
**Step 1**
Go to installer folder

cd C:\Onedrive\Work\LagunaLabs\kubereum-master

**Step 2**
Apply the different setup script
 
kubectl apply -f geth-config.yml -f geth-svc.yml -f geth-ds.yml -f geth-ethnetintel-ds.yml -f ethstats-dashboard-dp.yml -f solidity-browser-dp.yml -f solidity-browser-loadbalancer.yml -f ethstats-dashboard-loadbalancer.yml -f geth-loadbalancer.yml
 
**Step 3**

Test multiple command after set
 
Get pod and services 
kubectl get po,svc -o wide

To check events
kubectl get events

To logs
kubectl logs pod/geth-htkl5 -c init-genesis

kubectl logs pod/geth-p7gjv -c geth-ethnetintel

Also can check using infra app.
 
ethstats-dashboard
http://ethstats-dashboard-loadbalancer:3000/

solidity browser
http://solidity-browser-loadbalancer

 geth
http://geth-loadbalancer:8545/ 
 
 
 --------------------------------------------------------------------------------------

Example: setup in windows 

install choco

install choco git

install choco kubectl

install docker

choco install minikube

https://infra.app/
 

**For Local setup**
 
Set local minikube with kubectl
 
minikube start

minikube ip
 
minikube dashboard

kubectl config use-context minikube
 
kubectl cluster-info
 
minikube service list
 
**Step 1**
Go to installer folder

cd C:\Onedrive\Work\LagunaLabs\kubereum-master

**Step 2**
Apply the different setup script
 
kubectl apply -f geth-config.yml -f geth-svc.yml -f geth-ds.yml -f geth-ethnetintel-ds.yml -f ethstats-dashboard-dp.yml -f solidity-browser-dp.yml -f solidity-browser-loadbalancer.yml -f ethstats-dashboard-loadbalancer.yml -f geth-loadbalancer.yml
 
**Step 3**
 
Test multiple command after set

Get pod and services 
kubectl get po,svc -o wide

To check events
kubectl get events

**Step 4**
For make minikube accessible

minikube tunnel

Also can check using infra app.
 
ethstats-dashboard
http://127.0.0.1:3000/

solidity browser
http://127.0.0.1

 geth
http://127.0.0.1:8545/ 
 

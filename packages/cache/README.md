# Cache Server

This is a very simple service that listens to the chain for events, and publishes them to Redis/Elasticache so that the API server doesn't need to constantly query the chain.

## Setup & Installation

**For windows and others**
```
npm install
npm run start
```
**For unix-ubuntu**
```
sudo npm install
npm run start
```

## **Create docker**

**Building the Docker container**
```
sudo docker build . -t dockerid/blockchain-api
```

**Test the container**
```
sudo docker run -p 8080:8080 dockerid/blockchain-api
```

**Push Image to Dockerhub**
```
sudo docker login -u dockerid

sudo docker push dockerid/blockchain-api:latest
```
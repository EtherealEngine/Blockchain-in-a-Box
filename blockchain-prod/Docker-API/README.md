# REST API Server with docker

A neat little API for interacting with the blockchain.

## Setup & Installation

**for windows and others**

npm install

npm run start

**For unix-ubuntu**

sudo npm install --save puppeteer --unsafe-perm=true

sudo npm install

## **Create docker**

**build docker**

sudo docker build . -t dockerid/blockchain-api

**check image**

sudo docker images

**test docker**

sudo docker run -p 8080:8080 dockerid/blockchain-api

**push image to docker hub**

sudo docker login -u dockerid

sudo docker push dockerid/blockchain-api:latest

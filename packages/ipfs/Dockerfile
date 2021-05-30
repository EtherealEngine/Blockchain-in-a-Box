FROM node:14
WORKDIR /usr/src/app
RUN wget https://dist.ipfs.io/go-ipfs/v0.8.0/go-ipfs_v0.8.0_linux-amd64.tar.gz
RUN tar -xvzf go-ipfs_v0.8.0_linux-amd64.tar.gz
WORKDIR /usr/src/app/go-ipfs
RUN bash install.sh
RUN ipfs init
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
# IPFS host is exposed on 8080
EXPOSE 8080
EXPOSE 80
EXPOSE 443
COPY . .
CMD [ "node", "index.js" ]

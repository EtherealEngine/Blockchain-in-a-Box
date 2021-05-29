FROM node:14
WORKDIR /usr/src/app
RUN apt-get update
RUN apt-get -y install nodejs
RUN npm install -g npm
EXPOSE 6379
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "node", "index.js" ]
FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
EXPOSE 8545
EXPOSE 8546
EXPOSE 8547
EXPOSE 30303
EXPOSE 80
EXPOSE 443
COPY . .
CMD [ "node", "index.js" ]

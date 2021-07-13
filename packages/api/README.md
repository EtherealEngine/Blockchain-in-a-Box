# REST API Server

This is the main interface for interacting with the blockchain. Additionally, the cont

## Setup & Installation

**For Windows and others**
```
npm install
npm run start
```
**For Linux**
```
sudo npm install
```

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

# Blockchain-in-a-Box Contracts

Solidity smart contracts for Blockchain-in-a-Box.

# Setup and Installation

First, copy .env.default and rename it to .env, then configure it for the network you want to deploy to.

```
npm install
npm run deploy-<netwogrk> // i.e. npm run deploy-polygon
```
Consult package.json for more options

# Deployment

To deploy contracts, you will need several things:
1. A deployment wallet with enough Mainnet Ethereum, Rinkeby and/or Polygon/MATIC token to pay for the gas of deploying.
    Your best option is to download Metamask. Create a new Metamask wallet for this purpose so you can use the private keys for your signing authority.

2. Several BIP39 mnemonics and private keys
 -- Treasury addresses, for handling assets and coin owned by your treasury
 -- Signing addresses, for handling chain transfers and other transactions
 -- Private keys for each of the networks you want to interact with

 You can generate BIP39 mnemonics with Metamask (recommended) or here: 
 https://particl.github.io/bip39/bip39-standalone.html

The first step is to add your private keys to the .env file. You can export your private key from your Metamask wallet. Assuming you have one wallet with all of your deployment currency, this should look like this:

NOTE: STORE ALL MNEMONICS, ROOT/PRIVATE AND PUBLIC KEYS SOMEWHERE VERY SAFE!!!

```
.env
mainnet=a72ee7af443c3333e59d59a4273ce5a39a9f072a89fbc1cdbace0522197bf465
polygon=a72ee7af443c3333e59d59a4273ce5a39a9f072a89fbc1cdbace0522197bf465
mainnetsidechain=a72ee7af443c3333e59d59a4273ce5a39a9f072a89fbc1cdbace0522197bf465
testnet=a72ee7af443c3333e59d59a4273ce5a39a9f072a89fbc1cdbace0522197bf465
testnetsidechain=a72ee7af443c3333e59d59a4273ce5a39a9f072a89fbc1cdbace0522197bf465
testnetpolygon=a72ee7af443c3333e59d59a4273ce5a39a9f072a89fbc1cdbace0522197bf465
```

Next, you will need public wallet addresses, which are derived from BIP39 mnemonics.

These should be unique and generated per chain you hope to deploy to. You will need keys for both your signer and your treasury. The signer is responsible for signing off on transactions, while the treasury holds assets and coins on behalf of your org as a network peer.

Make sure you are generating addresses for the ethereum network. They will have a "0x" at the beginning.

```
.env
mainnetTreasuryAddress=0xebDeFbB0B1efc88603BF3Ea7DCac4d11628Fb862	
polygonTreasuryAddress=0x05FD932b8EE9E94CB80D799a298E0FfB233a42A7
mainnetsidechainTreasuryAddress=0x69E3396DFb3c9e4a0b8e8F63Cf74928f40f8e4a1
testnetTreasuryAddress=0x9aA26FaBE68BC7E6CF9af378b7d5DBB0af88D6Fb
testnetsidechainTreasuryAddress=0xd483045BC2044d71A7aA808F12d5356d145Dd31D
testnetpolygonTreasuryAddress=0xbd40A66Ff9A0029aB753ff6B28f8213752516e28

mainnetSignerAddress=0x0008255d48210c877ffd5c967b143B5c1523a71b
polygonSignerAddress=0xB8c2a35e92D5218CcA816EB7665e7525973F2b58
mainnetsidechainSignerAddress=0xaB592D52dE76f513BdafF8645d74772855FFaa42
testnetSignerAddress=0x0940A21a2430dA3B78e084c01baD302Bbb982442
testnetsidechainSignerAddress=0x39bc1f09A2b9ca9FD2BdE40Fa23789cC90e5F576
testnetpolygonSignerAddress=0xD2e62C19d31A987870f1582163A99702E3628D5E
```

Once your environment variables are set up, you are ready to deploy.

Your first deployment is, ideally, to a Ganache test server. If you've never used Truffle or Ganache before, you should start here:
https://www.trufflesuite.com/docs/truffle/quickstart

Once you've read up and done a practice deployment, you are ready to deploy to your private sidechain network. You can do that by running

```bash
npm run deploy-mainnetsidechain
```

If everything goes as planned, a list of addresses will be returned to you -- these are the addresses of your contracts. Write them down! In order to access assets from your contracts later, you will need these addresses.

Once you've deployed to the sidechain, you can additionally deploy to the polygon network and mainnet ethereum.

It is suggested that you start with the polygon/matic network and make sure your infrastructure is fully working before deploying contracts to mainnet ethereum. The contracts can be deployed on Polygon/Matic for a fraction of the mainnet gas fees.

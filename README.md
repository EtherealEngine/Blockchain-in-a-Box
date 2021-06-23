# Blockchain-in-a-Box
A batteries-included ethereum blockchain for bootstrapping the Metaverse.🚀🚀🚀

## What Is This?
A Node.js-based REST API, Ethereum node, cache service and smart contracts to deploy your own Ethereum-based sidechain for identity and durable assets. Users can transfer assets created on your platform to the Ethereum or Polygon main networks.

## Who Is It For?
1. Javascript developers who want to build interoperable applications with durable digital assets but don't have the resources to write everything from scratch and need a starting point which they can mold to their needs.

2. Developers interested in creating metaverse-scale interoperable applications where users may want to move their assets and identity to other platforms.

3. Developers of existing applications who cannot reasonably remove their database from their application and want to mirror this data onto blockchain or vice versa.

4. Organizations who wish to build blockchains with other organizations and need a standard and conventional way to do so.

## Any Resources to Help Me Learn What's Going On?
How to Code a Crypto Collectible: ERC-721 ASSET Tutorial (Ethereum)
https://www.youtube.com/watch?v=YPbgjPPC1d0

Build Your First Blockchain App Using Ethereum Smart Contracts and Solidity
https://www.youtube.com/watch?v=coQ5dg8wM2o

Node.js and Express.js - Full Course
https://www.youtube.com/watch?v=Oe421EPjeBE

Redis Caching with Node.js
https://www.youtube.com/watch?v=oaJq1mQ3dFI

Building an IPFS app with Node.js
https://www.youtube.com/watch?v=RMlo9_wfKYU

Pinata Cloud - The Broken Token (how Pinata can make NFTs more durable)
https://www.youtube.com/watch?v=0iuAvE-a0fI

# Setup and Installation

## Configure .env file
In the root folder create a clone of `.env.default` file and name it `.env`. Update the content of `.env` file with your resources. 

## Setup Pinata Account
Pinata is allows you to upload and manage files on IPFS. It provides IPFS API through which you can easily perform IPFS pinning service.

1. Open https://pinata.cloud/ and sigup/login.
2. Navigate to https://pinata.cloud/keys and create a new key. Make sure to check Admin key switch button in the modal.
3. Update `.env` file with following entries from generated key.
    ```
    PINATA_API_KEY=
    PINATA_SECRET_API_KEY=
    ```

# Deployment

## Local deployment
TODO

## Deployment to AWS
TODO

## Contributing
Pull requests are gladly accepted!

For bug fixes, please submit an issue. If you can fix the bug, submit a PR and link the issue.

For features, please submit an issue with your intention to add the feature and make a draft PR as soon as possible.

Please try to minimize changes to number of files or make multiple pull requests to minimize confusion or possible introduction of bugs.
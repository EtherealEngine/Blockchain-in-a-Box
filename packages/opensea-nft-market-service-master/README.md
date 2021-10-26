
## Installation

Make sure you have serverless installed 

```
npm install serverless -g
npm install
```

## Setup

env file required

```yml
IPFS_HOST=ipfs.infura.io
IPFS_PROTOCOL=https
IPFS_PORT=5001
APIETHERSCAN=USFF5FBG7QXESVII5GX8SIXXCZW6VRY3W8
DOMAIN_NAME=your.domain.for.your.api.com
CERTIFICATE_ARN 
ZONE_ID
IPFS_INFURA_PROJECT_ID=1wH8HCOBYnmdOGcC25ElTRMk4A3
IPFS_INFURA_SECRET=997d6a2c25c5dc93e418de4bb852cd42
```

## Running locally sls offline 

```
npm start
```

## To show/change your tokens

Please change content of 

db/index.ts

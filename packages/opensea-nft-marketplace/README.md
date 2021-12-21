#opensea

**.env file**

NODE_ENV=development

BROWSER=chrome

# incase you keep NFT data in static file in web

REACT_APP_SERVICE_URL=https://arkh-frontend.s3.us-west-1.amazonaws.com/basket

# incase you keep NFT data in XREngine inventory item API also change in index.ts

REACT_APP_SERVICE_URL=https://127.0.0.1:3030/inventory-item

XRENGINE_URL=https://127.0.0.1:3030/user-inventory

REACT_APP_RPC_URL_1=http://0.0.0.0:7545

REACT_APP_RPC_URL_4=https://rinkeby.infura.io/v3/1wH8HCOBYnmdOGcC25ElTRMk4A3

SKIP_PREFLIGHT_CHECK=true


Note: for ubuntu   BROWSER=/usr/bin/google-chrome-stable 

**change contract address to show your NFTs**

src/state/state.tsx line no 61

deployedNetwork.address = "0x6a18a01499a1126c216c70b1aa6e64afaf96f9a6"

**Run**

if fail for babbel then install
npm i babel-loader@8.1.0 --save

npm run start

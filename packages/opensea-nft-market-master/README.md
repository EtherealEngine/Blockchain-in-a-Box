1. Create .env file with your details

NODE_ENV=development
BROWSER=chrome
REACT_APP_SERVICE_URL=http://localhost:4000/dev
REACT_APP_RPC_URL_1=http://0.0.0.0:7545
REACT_APP_RPC_URL_4=https://rinkeby.infura.io/v3/1wH8HCOBYnmdOGcC25ElTRMk4A3
CONTRACT_ADDRESS=0x6a18a01499a1126c216c70b1aa6e64afaf96f9a6


2. change contract address to show your NFTs

src/state/state.tsx line no 61
deployedNetwork.address = "0x6a18a01499a1126c216c70b1aa6e64afaf96f9a6"



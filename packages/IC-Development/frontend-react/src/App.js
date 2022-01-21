import logo from './logo.svg';
import React from 'react'
import './App.css';
import { Principal } from "@dfinity/principal";
import {idlFactory} from './nft';
import {wicpFactory} from './wicp';
import ReactDOM from "react-dom";
import _ from "lodash";
import { HttpAgent } from "@dfinity/agent";


const id = [
  // Ledger canister Principal ID
  "ryjl3-tyaaa-aaaaa-aaaba-cai",
  
  // Ledger Canister Account ID
  "883eef7c44be51afe4a4420d4df4beff708f3cf2f5de5efcc9f58680bb0f3690",
  
  // NFT Canister Principal ID
  "gdpio-4iaaa-aaaal-aacea-cai",
  
  // NFT Canister Account ID
  "f5566bce9aa1c5e3c5735f1a5a7880aa30fccd9c0ec0914d49afc3b34d4f76de",
  
  // PLUG Wallet
  "msugr-nou37-xhgdk-fr3d6-2nnu6-dcsri-j7csy-iqeyz-yfq3r-ywyb5-fqe",

  // WICP Canister Principal ID
  "utozz-siaaa-aaaam-qaaxq-cai",
    
  // WICP Canister Account ID
  "cc659fe529756bae6f72db9937c6c60cf7ad57eb4ac5f930a75748927aab469a",
  
  ];

const mintParams = {
    key_val_data: [
      {
        key: 'name',
        val: {
          TextContent: "Joy1"
        }
      },
      {
        key: 'image',
        val: {
          TextContent: "https://nft22.s3.ap-south-1.amazonaws.com/eth/Player1.png"
        }
      }
    ],
    data: [],
    purpose: {Preview: null}
  }  

  let hasAllowed,nftUiActor,wicpUiActor,balance,name,symbol,element;
  (async () => {
   hasAllowed = window.ic?.plug?.requestConnect({
    whitelist: [ id[0], id[2] , id[5] ] // whitelisting canister ID's for plug
  });
  if (!hasAllowed) {
    console.log("allow the canisters");
  }

  const requestBalanceResponse = await window.ic?.plug?.requestBalance();
  balance = requestBalanceResponse[0]?.amount;
  //console.log(`Your wallet's ICP balance is ${balance}`);

   nftUiActor = await window.ic.plug.createActor({
    canisterId: id[2],
    interfaceFactory: idlFactory,
  });
  if (!nftUiActor) {
    console.log("failed to create nft-market actor");
  }

   wicpUiActor = await window.ic.plug.createActor({
    canisterId: id[5],
    interfaceFactory: wicpFactory,
  });
  if (!wicpUiActor) {
    console.log("failed to create cap-market actor");
  }
  name = await nftUiActor?.nameDip721();
  symbol = await nftUiActor?.symbolDip721();

  
  // My NFT
  const icTokens = await nftUiActor?.getMetadataForUserDip721(Principal.fromText(id[2]));
    console.log("Its token: ", icTokens);
    
    
    let tokenArray = []
    //let dataArray = []
    let KVArray = []
    //let purposeArray = []
    for(let i = 0; i<icTokens.length; i++){
      tokenArray.push(icTokens[i].token_id.toString())

      for(let j = 0; j<icTokens[i].metadata_desc.length; j++){
        /*
        for(let k = 0; k<icTokens[i].metadata_desc[j].data.length; k++){
          // console.log("$$D",icTokens[i].metadata_desc[j].data[k] )
          dataArray.push(icTokens[i].metadata_desc[j].data[k])
        }
        */
        for(let k = 0; k<icTokens[i].metadata_desc[j].key_val_data.length; k++){
          // console.log("$$KV",icTokens[i].metadata_desc[j].key_val_data[k] )
          KVArray.push(icTokens[i].metadata_desc[j].key_val_data[k])
        }
        /*
        for(let k = 0; k<icTokens[i].metadata_desc[j].purpose.length; k++){
          // console.log("$$PP",icTokens[i].metadata_desc[j].purpose[k].Preview )
          purposeArray.push(icTokens[i].metadata_desc[j].purpose[k])
        }
        */
      }
    }
    let mintDataJSON = document.createElement("div")
    let p = document.createElement('p')
    let tk = document.createElement('p')
    p.innerHTML = 'Token ID'
    tk.innerHTML =  JSON.stringify(tokenArray)
    mintDataJSON.appendChild(p)
    mintDataJSON.appendChild(tk)
    document.body.appendChild(mintDataJSON)
    /*
    let dataJSON = document.createElement("div")
    let p1 = document.createElement('p')
    let tk1= document.createElement('p')
    p1.innerHTML = 'Data : '
    tk1.innerHTML =  JSON.stringify(dataArray)
    dataJSON.appendChild(p1)
    dataJSON.appendChild(tk1)
    document.body.appendChild(dataJSON)
    */
    let KVdataJSON = document.createElement("div")
    let p2 = document.createElement('p')
    let tk2= document.createElement('p')
    p2.innerHTML = 'Key Value Data : '
    tk2.innerHTML =  JSON.stringify(KVArray)
    KVdataJSON.appendChild(p2)
    KVdataJSON.appendChild(tk2)
    document.body.appendChild(KVdataJSON)
  /*
    let pdataJSON = document.createElement("div")
    let p3 = document.createElement('p')
    let tk3= document.createElement('p')
    p3.innerHTML = 'Purpose Data : '
    tk3.innerHTML =  JSON.stringify(purposeArray)
    KVdataJSON.appendChild(p3)
    KVdataJSON.appendChild(tk3)
    document.body.appendChild(pdataJSON)
  */
  // all data NFT
  let len = await nftUiActor?.totalSupplyDip721()

  for (let i = 4; i < len; i++) {
      console.log(i," Token Details: ",await nftUiActor?.getMetadataDip721(i));
  }   

  element = <><div>
    <button onClick={minting}>mint</button>
    <button onClick={buy}>buy</button></div>
    <h4>Your wallet's ICP balance is {balance}</h4>
    <h4>Your NFT collection name is {name}</h4>
    <h4>Your NFT collection symbol is {symbol}</h4></>;
  ReactDOM.render(element, document.getElementById('root'));  

   
})();

  async function minting() {
    //const mintTokenId = await nftUiActor?.mintDip721(Principal.fromText(id[4]), [mintParams])
    //console.log("Its minting: ", mintTokenId);
  }  

async function buy() {
  
  let len = await nftUiActor?.totalSupplyDip721()
  
  for (let i = 3; i < len; i++) {
      console.log(i," Token Details: ",await nftUiActor?.getMetadataDip721(i));
      console.log("NFT Owner first: ", await nftUiActor?.ownerOfDip721(i));

      console.log(i," List Token: ",await nftUiActor?.listForSale(i,1));
      console.log(i," Approve Token: ",await wicpUiActor?.approve(Principal.fromText(id[2]),1000));

      console.log("Buy NFT Collection: ", await nftUiActor?.buyDip721(i));
      console.log("Buy Owner second: ", await nftUiActor?.ownerOfDip721(i));
  }
  
}

function App() {
  return (
    
    <div className="App">
      
        <button onClick={minting}>
          mint
        </button>
        <button onClick={buy}>
          buy
        </button>
    </div>
  );
}

export default App;

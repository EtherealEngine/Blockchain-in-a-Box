// Initialises the application listeners and handlers
function main() {
  const button = document.querySelector('#buy-button');
  button.addEventListener("click", onButtonPress);
}

const amount =  0;
const id = [

// Ledger canister Principal ID
"ryjl3-tyaaa-aaaaa-aaaba-cai",

// Ledger Canister Account ID
"883eef7c44be51afe4a4420d4df4beff708f3cf2f5de5efcc9f58680bb0f3690",

// NFT Canister Principal ID
"4pjdv-niaaa-aaaam-aaaoq-cai",

// NFT Canister Account ID
"32e746f02bb317684abd80ae99f5999e113963d5ebb4d9888946add891350b00"

];


// Button press handler
async function onButtonPress( el ) {
el.target.disabled = true;

const hasAllowed = await window.ic?.plug?.requestConnect({
    whitelist: [ id[0], id[2] ] // whitelisting canister ID's for plug
});

if (hasAllowed) {
  el.target.textContent = "Plug wallet is connected";
  console.log("Plug wallet is connected");

  const requestBalanceResponse = await window.ic?.plug?.requestBalance();
  const balance = requestBalanceResponse[0]?.amount;
  console.log(`Your wallet's ICP balance is ${balance}`);
 
  const ledgerUiActor = await window.ic.plug.createActor({
      canisterId: id[0],
      interfaceFactory: ledgerUI,
  });

  const nftUiActor = await window.ic.plug.createActor({
      canisterId: id[2],
      interfaceFactory: nftUI,
  });

  if (!nftUiActor) {
      console.log("failed to create nft-market actor")
  }

  if (!ledgerUiActor) {
    console.log("failed to create ledger actor")
  }

  console.log("Name of NFT Collection: ", await nftUiActor?.nameDip721());
  console.log("Its Symbol: ", await nftUiActor?.symbolDip721());
  let len=await nftUiActor?.totalSupplyDip721()
    for (let i = 0; i < len; i++) {
      console.log(i," Token Details: ", await nftUiActor?.getMetadataDip721(i));
    }

  const transferParams = {
    to: id[3],
    fee: { e8s: BigInt(10000n) },
    amount: {
      e8s: BigInt(1n)
    },
    memo: BigInt(24n),
    from_subaccount: [], // For now, using default subaccount to handle ICP
    created_at_time: [],
  }

  // const blockInfo = await window.ic.plug.requestTransfer(transferParams);
  //const blockInfo = await ledgerUiActor.send_dfx(transferParams);
  //console.log("Sent 1e-8 ICP to NFT Canister at height:", BigInt(blockInfo));
    
  } else {
    el.target.textContent = "Plug wallet connection was refused";
  }
   
  setTimeout(function () {
    el.target.disabled = false;
  }, 10000);
}

// Calls the Main function when the document is ready
document.addEventListener("DOMContentLoaded", main);

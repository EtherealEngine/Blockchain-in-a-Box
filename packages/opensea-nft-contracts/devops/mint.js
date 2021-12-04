require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')
const colors = require('colors')
const fetch = require('node-fetch')
const { utils, ethers } = require('ethers')
const NFTT = artifacts.require('NFTT.sol')
const path = require('path')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2), { string: ['nfts'] })
const start = async callback => {
  try {
    /*
    const objectsToBeMinted = []

    const currentTokens = await (await fetch(`https://arkh-frontend.s3.us-west-1.amazonaws.com/basket/token.json`)).json()
    const currentIndex = currentTokens.length
    console.log("currentIndex",currentIndex)
    const AMOUNT = currentTokens.length
    */
    const accounts = () =>
      new HDWalletProvider({
        mnemonic: process.env.KEY_MNEMONIC,
        providerOrUrl: process.env.WALLET_PROVIDER_URL,
      })
    //const FROM = "0x390ad305547FAa1A1C9E5502982E9636979efF73" //rinkeby
    //const FROM = "0x4Fa2360cFbCCf89ADC434621EEBb0B5490b3Ac94"  //dev
    const FROM = ethers.utils.getAddress(accounts().getAddresses()[0])
    console.log("FROM",FROM);

    /*
    for (let i = 1; i <= currentIndex; i++) {
      objectsToBeMinted.push(`Player${i}`)
    }
    console.log("FROM 2",objectsToBeMinted);
    */
    /*
    const mintAssetsOnIPFS = await (
      await fetch(`http://localhost:4000/dev/mint`, {
        method: 'POST',
        body: JSON.stringify({ objectsToBeMinted }),
      })
    ).json()*/
    const contract = await NFTT.deployed()
    const price = '.02'
    console.log("FROM 4");
    const priceWei = utils.parseEther(price)
    const ipfsURLs = []
    /*  
    const mintedTokens = await Promise.all(
      mintAssetsOnIPFS.map(async token => {
        ipfsURLs.push({
          name: token.name,
          image: `https://ipfs.io/ipfs/${token.path}`,
          description: `Description for ${token.name}`,
          external_url: 'https://xrengine.io/',
        })
        return await contract.mintCollectable(FROM, token.path, token.name, priceWei, true, {
          from: FROM,
        })
      })
    )*/
    
    const mintAssetsOnIPFS = [{ name: 'Player41', path: 'https://arkh-frontend.s3.us-west-1.amazonaws.com/basket-image/Player41.png' },
                              { name: 'Player42', path: 'https://arkh-frontend.s3.us-west-1.amazonaws.com/basket-image/Player42.png' }]
    const mintedTokens = await Promise.all(
      mintAssetsOnIPFS.map(async token => {
        console.log(token.name,token.path);
        ipfsURLs.push({
          name: token.name,
          image: `${token.path}`,
          description: `Description for ${token.name}`,
          external_url: 'https://xrengine.io/',
        })
        
        return await contract.mintCollectable(FROM, token.path, token.name, priceWei, true, {
          from: FROM,
        })
      })
    )
    /*
    const mintedTokens = await Promise.all(contract.mintCollectable(FROM, "https://gateway.pinata.cloud/ipfs/QmUEBJ17YyKDzh4ZJEBoN3gSWfaQwx4zVwyjvojm1CZKaJ", "Player 2", priceWei, true, {
      from: FROM,
    }));
    
    const content = `export const tokenProps = ${JSON.stringify([...currentTokens, ...ipfsURLs])}`

    const file = path.resolve(__dirname, '../', 'db.ts')
    await fs.writeFileSync(file, content)
    */
    console.log(colors.green(`⚡️ Tokens created: ${colors.white(mintedTokens.length)}`))
    callback()
    process.exit(0)
  } catch (e) {
    console.log(e)
    callback(e)
  }
}

module.exports = start

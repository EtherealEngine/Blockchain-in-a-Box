require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')
const colors = require('colors')
const fetch = require('node-fetch')
const { utils, ethers } = require('ethers')
const NFTT = artifacts.require('NFTT.sol')
const path = require('path')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2), { string: ['nfts'] })

const { SERVICE_URL } = "http://localhost:4000/dev"

const start = async callback => {
  try {
    const objectsToBeMinted = []

    const currentTokens = await (await fetch(`http://localhost:4000/dev/token`)).json()
    const currentIndex = currentTokens.length
    const AMOUNT = currentTokens.length

    const accounts = () =>
      new HDWalletProvider({
        mnemonic: process.env.KEY_MNEMONIC,
        providerOrUrl: process.env.WALLET_PROVIDER_URL,
      })
    //const FROM = "0x390ad305547FAa1A1C9E5502982E9636979efF73"
    const FROM = ethers.utils.getAddress(accounts().getAddresses()[0])
    console.log("FROM",FROM);
    for (let i = currentIndex; i < currentIndex + AMOUNT; i++) {
      objectsToBeMinted.push(`Player${i}`)
    }
    console.log("FROM 2",objectsToBeMinted);
    /*
    const mintAssetsOnIPFS = await (
      await fetch(`http://localhost:4000/dev/mint`, {
        method: 'POST',
        body: JSON.stringify({ objectsToBeMinted }),
      })
    ).json()*/
    const contract = await NFTT.deployed()
    const price = '.01'
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
    
    const mintAssetsOnIPFS = [{ name: 'Player5', path: 'https://gateway.pinata.cloud/ipfs/QmSpiATZRZvp1xPAuDepPBSjRgScZZDprDRNsNsMQcpEFb' },
                              { name: 'Player6', path: 'https://gateway.pinata.cloud/ipfs/QmR8gUQSdNJvpUjFXGp5TFWC7ktWmsqYY77PUytvicymSv' },
                              { name: 'Player7', path: 'https://gateway.pinata.cloud/ipfs/QmYLAMmL3V3ShxcYjHkm52syoiHxzvuUoigU4QsYUQn2i1' },
                              { name: 'Player8', path: 'https://gateway.pinata.cloud/ipfs/QmSTRW49RrFW4X4dXrKJNRLhCzVmr7NzjgyPLSuceKiead' },
                              { name: 'Player9', path: 'https://gateway.pinata.cloud/ipfs/QmUEBJ17YyKDzh4ZJEBoN3gSWfaQwx4zVwyjvojm1CZKaJ' }]
    const mintedTokens = await Promise.all(
      mintAssetsOnIPFS.map(async token => {
        console.log(token.name);
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
    */
    const content = `export const tokenProps = ${JSON.stringify([...currentTokens, ...ipfsURLs])}`

    const file = path.resolve(__dirname, '../', 'db.ts')
    await fs.writeFileSync(file, content)

    console.log(colors.green(`⚡️ Tokens created: ${colors.white(mintedTokens.length)}`))
    callback()
    process.exit(0)
  } catch (e) {
    console.log(e)
    callback(e)
  }
}

module.exports = start

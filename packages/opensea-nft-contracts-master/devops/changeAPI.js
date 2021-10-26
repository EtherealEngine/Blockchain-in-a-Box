require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')
const { ethers } = require('ethers')
const NFTT = artifacts.require('NFTT.sol')
console.log("hello");
const start = async callback => {
  try {
    console.log("hello");
    const accounts = () =>
      new HDWalletProvider({
        mnemonic: process.env.KEY_MNEMONIC,
        providerOrUrl: process.env.WALLET_PROVIDER_URL,
      })
    console.log(process.env.WALLET_PROVIDER_URL);
    const FROM = ethers.utils.getAddress(accounts().getAddresses()[0])
    const contract = await NFTT.deployed()

    const response = await contract.setBaseURI('https://arkh-frontend.s3.us-west-1.amazonaws.com/basket/', {
      from: FROM,
    })

    callback(JSON.stringify(response))
  } catch (e) {
    callback(e)
  }
}

module.exports = start

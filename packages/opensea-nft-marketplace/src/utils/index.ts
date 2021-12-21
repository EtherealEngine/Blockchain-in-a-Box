require('dotenv').config()
const { REACT_APP_SERVICE_URL ,XRENGINE_URL } = process.env

console.log("REACT_APP_SERVICE_URL",REACT_APP_SERVICE_URL)
console.log(process.env)
//export const ETHSCAN_API = `${REACT_APP_SERVICE_URL}/ethusd`
export const METADATA_API = REACT_APP_SERVICE_URL || ''
export const XRENGINE_API_URL = XRENGINE_URL || 'https://127.0.0.1:3030/user-inventory'

export * from './toShort'
export * from './formatPriceEth'

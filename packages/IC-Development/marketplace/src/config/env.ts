export const ENV = {
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV !== 'production',
  apiURL: process.env.API_URL || 'http://localhost:9999',
  lambdaURL: process.env.LAMBDA_URL || 'http://localhost:3000/development',
  nftCanisterId: process.env.NFT_CANISTER_ID || 'rno2w-sqaaa-aaaaa-aaacq-cai',
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID || '913522398450565180',
  },
  capRaffleCanisterId:
    process.env.CAP_RAFFLE_CANISTER_ID || 'rkp4c-7iaaa-aaaaa-aaaca-cai',
  appURL: process.env.APP_URL || 'http://localhost:9000',
};

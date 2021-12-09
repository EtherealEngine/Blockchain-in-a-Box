const { DefinePlugin } = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = (env) => {
  return merge(common(env), {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
      new DefinePlugin({
        'process.env.API_URL': JSON.stringify(
          process.env.API_URL || 'https://mainnet.dfinity.network'
        ),
        'process.env.LAMBDA_URL': JSON.stringify(
          process.env.LAMBDA_URL ||
            'https://9ddo2me0a2.execute-api.us-east-1.amazonaws.com/production'
        ),
        'process.env.CAP_RAFFLE_CANISTER_ID': JSON.stringify(
          process.env.CAP_RAFFLE_CANISTER_ID || 'q675d-biaaa-aaaam-qaanq-cai'
        ),
        'process.env.NFT_CANISTER_ID': JSON.stringify(
          process.env.NFT_CANISTER_ID || 'vlhm2-4iaaa-aaaam-qaatq-cai'
        ),
        'process.env.DISCORD_CLIENT_ID': JSON.stringify(
          process.env.DISCORD_CLIENT_ID || '912803477653184532'
        ),
        'process.env.APP_URL': JSON.stringify(
          process.env.APP_URL ||
            'https://6smot-4yaaa-aaaad-qa3vq-cai.ic.fleek.co'
        ),
      }),
    ],
  });
};

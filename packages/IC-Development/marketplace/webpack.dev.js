const path = require('path');
const { DefinePlugin } = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = (env) => {
  return merge(common(env), {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      hot: true,
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 9000,
      devMiddleware: {
        index: true,
        mimeTypes: { 'text/html': ['phtml'] },
        serverSideRender: true,
        writeToDisk: true,
      },
    },
    resolve: {
      alias: {
        '@mocks': path.join(__dirname, '/mocks'),
      },
    },
    plugins: [
      new DefinePlugin({
        'process.env.API_URL': JSON.stringify(
          process.env.API_URL || 'https://mainnet.dfinity.network'
        ),
        'process.env.LAMBDA_URL': JSON.stringify(
          process.env.LAMBDA_URL ||
            'https://58at4kirk9.execute-api.us-east-1.amazonaws.com/development'
        ),
        'process.env.CAP_RAFFLE_CANISTER_ID': JSON.stringify(
          process.env.CAP_RAFFLE_CANISTER_ID || 'qsgjb-riaaa-aaaaa-aaaga-cai'
        ),
        'process.env.NFT_CANISTER_ID': JSON.stringify(
          process.env.NFT_CANISTER_ID || 'rpvd4-zaaaa-aaaam-qaaia-cai'
        ),
        'process.env.DISCORD_CLIENT_ID': JSON.stringify(
          process.env.DISCORD_CLIENT_ID || '913522398450565180'
        ),
        'process.env.APP_URL': JSON.stringify(
          process.env.APP_URL || 'http://localhost:9000'
        ),
      }),
    ],
  });
};

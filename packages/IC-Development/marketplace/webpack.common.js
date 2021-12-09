const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
require('dotenv');

module.exports = (env) => {
  return {
    entry: './src/index.tsx',
    output: {
      path: path.join(__dirname, 'public/js'),
      publicPath: '/public',
      filename: 'bundle.js',
      sourceMapFilename: 'bundle.js.map',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        '@': path.join(__dirname, '/src'),
      },
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.html$/,
          use: {
            loader: 'html-loader',
            options: {
              attrs: [':src'],
            },
          },
        },
      ],
    },
    plugins: [new CleanWebpackPlugin()],
  };
};

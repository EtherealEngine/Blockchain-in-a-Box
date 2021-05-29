require('dotenv').config();

const fs = require('fs');

const config = fs.existsSync(__dirname + '/config.json') ? require('./config.json') : null;

const redisKey = (config && config.redisKey) ?? process.env.REDIS_KEY ?? "default";
const polygonVigilKey = (config && config.polygonVigilKey) ?? process.env.POLYGON_VIGIL_KEY ?? `1bdde9289621d9d420488a9804254f4a958e128b`;
const infuraProjectId = (config && config.infuraProjectId) ?? process.env.infuraProjectId;
const ethereumHost = (config && config.ethereumHost) ?? process.env.ETHEREUM_HOST ?? 'ethereum.exokit.org';
const storageHost = (config && config.storageHost) ?? process.env.STORAGE_HOST ?? 'https://ipfs.exokit.org';
const appPreviewHost = (config && config.appPreviewHost) ?? process.env.APP_PREVIEW_HOST ?? `https://app.webaverse.com/preview.html`;

if(!redisKey) console.warn("Environment vars not set successfully, do you have config.json or env vars set up?");

module.exports = {
    redisKey,
    polygonVigilKey,
    infuraProjectId,
    ethereumHost,
    storageHost,
    appPreviewHost
}
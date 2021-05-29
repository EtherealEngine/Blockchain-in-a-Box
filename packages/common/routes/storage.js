const url = require('url');
const https = require('https');
const {uploadFromStream} = require('../aws.js');
const crypto = require('crypto');
const mime = require('mime');
const {_setCorsHeaders, getExt} = require('../utils.js');

const hashAlgorithm = 'sha256';
const MAX_SIZE = 50 * 1024 * 1024;

const _handleStorageRequest = async (req, res) => {
    try {
        const request = url.parse(req.url);
        const match = request.path.match(/^\/([a-f0-9]+)(?:\/([^\/]*))?/i);
        const path = match && match[1];
        const filename = match && match[2];

        res = _setCorsHeaders(res);
        const {method} = req;
        if (method === 'OPTIONS') {
            res.end();
        } else if (method === 'POST') {
            let data = [];
            const hash = crypto.createHash(hashAlgorithm);
            let totalSize = 0;
            req.on('data', chunk => {
                // console.log('got data', chunk.length);
                data.push(chunk);
                hash.write(chunk);
                totalSize += chunk.byteLength;
                if (totalSize >= MAX_SIZE) {
                  res.statusCode = 413;
                  res.end();
                }
            })
            req.on('end', async () => {
                // console.log('got end');
                const hashHex = hash.digest('hex');
                const type = req.headers['content-type'];
                const ws = uploadFromStream('storage.exokit.org', hashHex, type);

                ws.on('error', err => {
                  // console.log('got error', err);
                  res.status = 500;
                  res.end(err.stack);
                });
                ws.on('done', () => {
                  // console.log('got done', data);
                  res.end(JSON.stringify({
                    hash: hashHex,
                  }));
                });

                let i = 0;
                const _recurse = () => {
                  while (i < data.length) {
                    const ok = ws.write(data[i]);
                    // console.log('send', i, data[i].length, ok);
                    i++;
                    if (!ok) {
                      ws.once('drain', _recurse);
                      return;
                    }
                  }
                  ws.end();
                };
                _recurse();
            });
        } else if (method === 'GET' && path) {
            const proxyReq = https.request('https://s3-us-west-1.amazonaws.com/storage.exokit.org/' + path, proxyRes => {
              res.status = proxyRes.status;
              /* const type = req.headers['content-type'];
              if (type) {
                res.setHeader('content-type', type);
              } */

              const ext = filename && getExt(filename);
              const contentType = ext ? mime.getType(ext) : 'application/octet-stream';
              res.setHeader('content-type', contentType);
              proxyRes.pipe(res);
              proxyRes.on('error', err => {
                res.status = 500;
                res.end(err.stack);
              });
            });
            proxyReq.end();
            proxyReq.on('error', err => {
              res.status = 500;
              res.end(err.stack);
            });
            // res.writeHead(301, {"Location": 'https://s3-us-west-1.amazonaws.com/storage.exokit.org/' + path});
            // res.end();
        } else if (method === 'DELETE' && path) {
            res.statusCode = 200;
            res.end();
        } else {
            res.statusCode = 404;
            res.end();
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
  _handleStorageRequest,
}
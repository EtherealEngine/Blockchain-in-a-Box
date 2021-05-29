const url = require('url');
const {_setCorsHeaders} = require('../utils.js');
const blockchain = require('../blockchain.js');
const accountManager = require('../account-manager.js');

/* const _jsonParse = s => {
   try {
       return JSON.parse(s);
   } catch(err) {
       return null;
   }
}; */

const _handleAccountsRequest = async (req, res) => {
    const request = url.parse(req.url);
    const path = request.path.split('/')[1];
    let match;
    try {
        res = _setCorsHeaders(res);
        const {method} = req;
        if (method === 'OPTIONS') {
            res.end();
        } else if (method === 'GET') {
            if (path === 'latestBlock') {
                const latestBlock = await blockchain.getLatestBlock();
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(latestBlock, null, 2));
            } else if ((match = request.path.match(/^\/getEvents\/([^\/]+)\/([0-9]+)\/([0-9]+)$/))) {
                const eventTypes = match[1].split(',');
                const startBlock = parseInt(match[2], 10);
                const endBlock = parseInt(match[3], 10);
                let result = [];
                await Promise.all(eventTypes.map(eventType =>
                    blockchain.getEvents(eventType, startBlock, endBlock)
                        .then(events => {
                            result.push.apply(result, events);
                        })
                ));
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result, null, 2));
            } else {
                res.statusCode = 404;
                res.end();
            }
        } else if (method === 'POST') {
            const bs = [];
            req.on('data', d => {
                bs.push(d);
            });
            req.on('end', async () => {
                try {
                  const b = Buffer.concat(bs);
                  const s = b.toString('utf8');

                  if (path === 'sendTransaction') {
                    const spec = JSON.parse(s);
                    const transaction = await blockchain.runTransaction(spec);
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(transaction, null, 2));
                  } else {
                    const userKeys = await accountManager.getAccount();
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(userKeys, null, 2));
                  }
                } catch (err) {
                  console.log(err);
                  res.statusCode = 500;
                  res.end(err.stack);
                }
            });
        } else {
          res.statusCode = 404;
          res.end();
        }
    } catch (err) {
        console.log(err);
        res.statusCode = 500;
        res.end(err.stack);
    }
}

module.exports = {
    _handleAccountsRequest,
}
const path = require('path');
const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const os = require('os');
const child_process = require('child_process');
const FormData = require('form-data');
const httpProxy = require('http-proxy');

const CERT = fs.readFileSync('./certs/fullchain.pem');
const PRIVKEY = fs.readFileSync('./certs/privkey.pem');

const PORT = parseInt(process.env.PORT, 10) || 80;

Error.stackTraceLimit = 300;

(async () => {

const ipfsRepoLockPath = path.join(os.homedir(), '.ipfs', 'repo.lock');
try {
  fs.unlinkSync(ipfsRepoLockPath);
} catch (err) {
  if (err.code === 'ENOENT') {
    // nothing
  } else {
    console.warn(err.stack);
  }
}
const ipfsProcess = child_process.spawn('ipfs', [
  'daemon',
  '--writable',
]);
ipfsProcess.stdout.pipe(process.stdout);
ipfsProcess.stderr.pipe(process.stderr);
ipfsProcess.on('exit', code => {
  console.warn('ipfs exited', code);
});

const _readJson = (proxyRes, cb) => {
  const bs = [];
  proxyRes.on('data', function(d) {
    bs.push(d);
  });
  proxyRes.on('end', function() {
    const b = Buffer.concat(bs);
    const s = b.toString('utf8');
    // console.log('got json result', {headers: proxyRes.headers, s});
    const split = s.split('\n');
    const js = split.filter(s => !!s).map(s => JSON.parse(s));
    cb(null, js);
  });
  proxyRes.on('error', err => {
    cb(err, null);
  });
};

const MAX_SIZE = 50 * 1024 * 1024;
const IPFS_HTTP_PORT = 8080;
const IPFS_PORT = 5001;
const addUrl = `http://127.0.0.1:${IPFS_PORT}/api/v0/add`;
const _handleIpfs = async (req, res) => {
  const _respond = (statusCode, body) => {
    res.statusCode = statusCode;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(body);
  };
  const _setCorsHeaders = res => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
  };

try {
    const {method, headers} = req;

    _setCorsHeaders(res);
    if (method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
    } else if (method === 'GET') {
      const match = req.url.match(/^(\/ipfs)?(\/[a-z0-9]+\/?)/i);
      if (match) {
        console.log('got match', req.url, match);
        let url;
        if (match[1]) { // /ipfs/ API
          url = req.url;
        } else { // our / API
          url = (match[1] || '/ipfs') + match[2];
        }
        const proxy = httpProxy.createProxyServer({});
        req.url = url;
        proxy
          .web(req, res, {
            target: `http://127.0.0.1:${IPFS_HTTP_PORT}`,
            // secure: false,
            // changeOrigin: true,
          }, err => {
            console.warn(err.stack);

            res.statusCode = 500;
            res.end();
          });
      } else {
        console.log('no match', req.url);
        
        res.statusCode = 404;
        res.end();
      }
    } else if (method === 'POST') {
      const contentType = headers['content-type'];
      const contentLength = parseInt(headers['content-length'], 10) || 0;
      const isFormData = /^multipart\/form\-data;/.test(contentType);
      console.log('got post content type', {contentType, isFormData});
      
      const bs = [];
      let totalSize = 0;
      const _data = d => {
        bs.push(d);
        totalSize += d.byteLength;
        if (totalSize >= MAX_SIZE) {
          _respond(413, JSON.stringify({
            error: 'payload too large',
          }));
          
          req.removeListener('data', _data);
          req.removeListener('end', _end);
        }
      };
      req.on('data', _data);
      const _end = () => {
        const b = Buffer.concat(bs);
        bs.length = 0;
        
        console.log('end', b.length);

        if (isFormData) {
          console.log('end form data', isFormData);
          const proxyReq = http.request(addUrl, {
            method: 'POST',
            headers: {
              'Content-Type': contentType,
              'Content-Length': contentLength,
            },
          }, proxyRes => {
            console.log('got proxy res 1', proxyRes.statusCode);
            if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
              _readJson(proxyRes, (err, js) => {
                console.log('got proxy res 2', err, js);
                if (!err) {
                  res.end(JSON.stringify(js.map(j => ({
                    name: j.Name,
                    hash: j.Hash,
                  }))));
                } else {
                  res.statusCode = 500;
                  res.end(JSON.stringify(err));
                }
              });
            } else {
              console.log('status code error in form', proxyRes.statusCode, proxyRes.headers);
              
              res.statusCode = proxyRes.statusCode;
              proxyRes.pipe(res);
            }
          });
          proxyReq.end(b);
          proxyReq.on('error', err => {
            console.log('got error', err);
            
            res.statusCode = 500;
            res.end(JSON.stringify(err));
          });
        } else {
          const form = new FormData();
          form.append('file', b);
          form.submit(addUrl, function(err, proxyRes) {
            if (!err) {
              if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
                _readJson(proxyRes, (err, js) => {
                  if (!err) {
                    res.end(JSON.stringify({
                      hash: js[0].Hash,
                    }));
                  } else {
                    res.statusCode = 500;
                    res.end(JSON.stringify(err));
                  }
                });
              } else {
                console.log('status code error in regular', proxyRes.statusCode, proxyRes.headers);
                
                res.statusCode = proxyRes.statusCode;
                proxyRes.pipe(res);
              }
            } else {
              _respond(500, err.stack);
            }
          });
        }
      };
      req.on('end', _end);
    } else {
      _respond(500, JSON.stringify({
        error: "Unknown error",
      }));
    }
} catch(err) {
  console.warn(err);

  _respond(500, JSON.stringify({
    error: err.stack,
  }));
}
};

const _req = protocol => (req, res) => {
try {
  const o = url.parse(protocol + '//' + (req.headers['host'] || '') + req.url);
  console.log('got req', req.method, o);
  if (o.host === 'ipfs.exokit.org') {
    _handleIpfs(req, res);
    return;
  }

  res.statusCode = 404;
  res.end('host not found');
} catch(err) {
  console.warn(err.stack);

  res.statusCode = 500;
  res.end(err.stack);
}
};

const server = http.createServer(_req('http:'));
const server2 = https.createServer({
  cert: CERT,
  key: PRIVKEY,
}, _req('https:'));

const _warn = err => {
  console.warn('uncaught: ' + err.stack);
};
process.on('uncaughtException', _warn);
process.on('unhandledRejection', _warn);

server.listen(PORT);
server2.listen(443);

console.log(`http://127.0.0.1:${PORT}`);
console.log(`https://127.0.0.1:443`);

})();

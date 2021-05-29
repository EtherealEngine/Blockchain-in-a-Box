const path = require('path');
const url = require('url');
const fs = require('fs').promises;
// const https = require('https');
// const { putObject, uploadFromStream } = require('../aws.js');
// const crypto = require('crypto');
const child_process = require('child_process');
// const mime = require('mime');
const {_setCorsHeaders} = require('../utils.js');
const ps = require('ps-node');
const {s3} = require('../aws.js');
const {privateIp, publicIp} = require('../config.js');

const jsPath = '../dialog/index.js';
const bucketName = 'worlds.exokit.org';
const pidSymbol = Symbol('pid');

let startPort = 4000;
let endPort = 5000;

class WorldManager {
  constructor() {
    this.worlds = [];
    this.childProcesses = [];
    this.runnings = {};
    this.queues = {};

    this.loadPromise = this.loadWorlds();
  }
  waitForLoad() {
    return this.loadPromise;
  }
  findPort() {
    if (this.worlds.length > 0) {
      for (let port = startPort; port < endPort; port++) {
        if (!this.worlds.some(world => world.port === port)) {
          return port;
        }
      }
      return null;
    } else {
      return startPort;
    }
  }
  async loadWorlds() {
    this.worlds = await new Promise((accept, reject) => {
      ps.lookup({
        command: 'node',
        // psargs: 'ux',
      }, function(err, results) {
        if (!err) {
          results = results
            .filter(w => w.arguments[0] === jsPath)
            .map(w => {
              const {pid} = w;
              // eslint-disable-next-line no-unused-vars
              let [_, name, publicIp, privateIp, port] = w.arguments;
              port = parseInt(port, 10);
              return {
                name,
                publicIp,
                privateIp,
                port,
                [pidSymbol]: pid,
              };
            });
          console.log('got load world results', results);
          accept(results);
        } else {
          /* resultList.forEach(function( process ){
            if( process ){
              console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
            }
          }); */
          reject(err);
        }
      });
    });
  }
  async createWorld(name) {
    console.log('create world', name, new Error().stack);
    if (!this.runnings[name]) {
      this.runnings[name] = true;

      try {
        if (!this.worlds.some(w => w.name === name)) {
          let b;
          try {
            const o = await s3.getObject({
              Bucket: bucketName,
              Key: name,
            }).promise();
            console.log('got object', o);
            b = o.Body;
          } catch(err) {
            if (err.code === 'NoSuchKey') {
              // nothing
            } else {
              console.warn(err.stack);
            }
            b = null;
          }
          const dataFilePath = path.join(path.dirname(jsPath), 'data', name + '.bin');
          // console.log('placing data', b && b.byteLength);
          if (b) {
            await fs.writeFile(dataFilePath, b); 
          }

          const fullchain = path.join('..', 'exokit-backend', 'certs', 'fullchain.pem');
          let fullChainExists = fs.existsSync(fullchain);       
          const privkey = path.join('..', 'exokit-backend', 'certs', 'privkey.pem');
          let privkeyExists = fs.existsSync(privkey);     
          if(!fullChainExists || !privkeyExists){
            console.warn("WARNING: Couldn't retrieve SSL certs locally");
          }
          const port = this.findPort();
          const cp = child_process.spawn(process.argv[0], [
            jsPath,
            name,
            publicIp,
            privateIp,
            port,
          ], {
            cwd: path.dirname(jsPath),
            env: {
              PROTOO_LISTEN_PORT: port,
              MEDIASOUP_LISTEN_IP: privateIp,
              MEDIASOUP_ANNOUNCED_IP: publicIp,
              // NOTE: These certs will not be available in CI-produced builds
              HTTPS_CERT_FULLCHAIN: fullChainExists ? fullchain : null,
              HTTPS_CERT_PRIVKEY: privkeyExists ? privkey : null,
              AUTH_KEY: privkeyExists ? privkey : null,
              DATA_FILE: dataFilePath,
              // NUM_WORKERS: 2,
            },
          });

          
          cp.name = name;
          cp.dataFilePath = dataFilePath;
          cp.stdin.end();
          cp.stdout.pipe(process.stdout);
          cp.stderr.pipe(process.stderr);
          cp.on('error', err => {
            console.log('cp error', err.stack);
          });
          cp.on('exit', code => {
            console.log('cp exit', code);
            this.loadWorlds();
            this.childProcesses.splice(this.childProcesses.indexOf(cp), 1);
          });
          this.childProcesses.push(cp);

          await new Promise((accept, reject) => {
            cp.stdout.setEncoding('utf8');
            const _data = s => {
              if (/ready\n/.test(s)) {
                console.log('got dialog ready');

                accept();
                cp.stdout.removeListener('data', _end);
                cp.stdout.removeListener('end', _end);
              }
            };
            cp.stdout.on('data', _data);
            const _end = () => {
              reject(new Error('dialog did not output ready'));
            };
            cp.stdout.on('end', _end);
          });

          await this.loadWorlds();

          return {
            name,
            publicIp,
            privateIp,
            port,
          };
        } else {
          return null;
        }
      } finally {
        this.runnings[name] = false;

        const queue = this.queues[name] || [];
        if (queue.length > 0) {
          queue.splice(0, 1)();
        }
      }
    } else {
      return await new Promise((accept) => {
        this.queues.push(async () => {
          const world = await this.createWorld(name);
          accept(world);
        });
      });
    }
  }
  async deleteWorld(name) {
    if (!this.runnings[name]) {
      this.runnings[name] = true;

      try {
        const world = this.worlds.find(w => w.name === name);

        if (world) {
          const cp = this.childProcesses.find(cp => cp.name === name);
          if (cp) {
            cp.kill();

            await new Promise((accept) => {
              cp.on('exit', async () => {
                const b = await fs.readFile(cp.dataFilePath);
                await s3.putObject({
                  Bucket: bucketName,
                  Key: name,
                  ContentType: 'application/octet-stream',
                  ContentLength: b.length,
                  Body: b,
                }).promise();

                await fs.unlink(cp.dataFilePath);

                accept();
              });
            });
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } finally {
        this.runnings[name] = false;

        const queue = this.queues[name] || [];
        if (queue.length > 0) {
          queue.splice(0, 1)();
        }
      }
    } else {
      return await new Promise((accept) => {
        this.queues.push(async () => {
          const result = await this.deleteWorld(name);
          accept(result);
        });
      });
    }
  }
}
const worldManager = new WorldManager();

const _handleWorldsRequest = async (req, res) => {
  try {
    const {method, headers, url: u} = req;
    const o = url.parse(u);
    const match = decodeURIComponent(o.path).match(/^\/([a-z0-9\-\ \.]+)$/i);
    const p = match && match[1];

    res = _setCorsHeaders(res);
    
    console.log('get worlds request', {method, headers, o, p});
    
    if (method === 'OPTIONS') {
      res.end();
    } else if (method === 'GET' && o.path == '/') {
      res.end(JSON.stringify(worldManager.worlds));
    } else if (method === 'GET' && p) {
      const name = p;
      const world = worldManager.worlds.find(world => world.name === name);
      if (world) {
        res.end(JSON.stringify({
          result: world,
        }));
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({error: 'world not found'}));
      }
    } else if (method === 'POST' && p) {
      const name = p;
      const world = await worldManager.createWorld(name);

      if (world) {
        res.end(JSON.stringify({
          result: world,
        }));
      } else {
        res.statusCode = 400;
        res.end(JSON.stringify({error: 'name already taken'}));
      }
    } else if (method === 'DELETE' && p) {
      const name = p;
      const ok = await worldManager.deleteWorld(name);
      if (ok) {
        res.statusCode = 200;
        res.end();
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({error: 'world not found'}));
      }
    } else {
      res.statusCode = 404;
      res.end();
    }
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  worldManager,
  _handleWorldsRequest,
}
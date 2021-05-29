const fs = require('fs');
const child_process = require('child_process');
const {initCaches} = require('./cache.js');
const {redisKey} = require('./environment.js');

let redisConfTxt = fs.readFileSync('./redis.conf.template', 'utf8');
redisConfTxt = redisConfTxt.replace(/# requirepass foobared/, `requirepass ${redisKey}`);
fs.writeFileSync('./redis.conf', redisConfTxt);

const cp = child_process.spawn('./redis-server', [
  './redis.conf',
]);
cp.on('error', err => {
  console.warn(err);
  process.exit(1);
});
cp.stdout.setEncoding('utf8');
cp.stdout.on('data', async s => {
  try {
    // console.log('got data', s);
    if (/Ready to accept connections/i.test(s)) {
      console.log('initializing caches');
      await initCaches();
      console.log('caches initialized');
    }
  } catch (err) {
    console.warn('failed to initialize caches', err);
  }
});
cp.stderr.setEncoding('utf8');
cp.stderr.on('data', s => {
  console.warn(s);
});
cp.on('exit', code => {
  console.warn(`redis exited with code ${code}`);
  process.exit(code);
});
process.on('exit', () => {
  cp.kill();
});

const _warn = err => {
  console.warn('uncaught: ' + err.stack);
};
process.on('uncaughtException', _warn);
process.on('unhandledRejection', _warn);
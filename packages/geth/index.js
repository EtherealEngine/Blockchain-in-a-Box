const fs = require('fs');
const childProcess = require('child_process');
const os = require('os');

const accountMainnetJson = JSON.parse(fs.readFileSync('./account-mainnet.json', 'utf8'));
const accountRinkebyJson = JSON.parse(fs.readFileSync('./account-rinkeby.json', 'utf8'));

const networkInterfaces = os.networkInterfaces();
const eth0Interface = networkInterfaces.eth0.find(spec => spec.family === 'IPv4');
const eth0Address = eth0Interface.address;

const mainnetNetworkId = 1338;
const sidechainNetworkId = 1337;
const isMiner = true;

// geth --datadir rinkeby init genesis-rinkeby.json
// cp ./static-nodes-rinkeby.json ./rinkeby/static-nodes.json
// cp ./account-rinkeby.json ./rinkeby/keystore/UTC--2020-10-20T10-26-51.208063624Z--a57c89548a982eb90dda1d8069b73355c2effc34
// geth --datadir rinkeby --http --http.addr 172.31.2.5 --http.corsdomain '*' --mine --minerthreads 1 --miner.gasprice 0 --targetgaslimit '1000000000' --syncmode full --networkid 1337 --etherbase '0xa57c89548a982eb90dda1d8069b73355c2effc34' --allow-insecure-unlock --unlock '0xa57c89548a982eb90dda1d8069b73355c2effc34' --password ./password
const cpSidechain = childProcess.spawn('geth', [
	'--datadir', 'rinkeby',
	'--http',
	'--http.addr', eth0Address,
	'--http.corsdomain', '*',
	'--http.port', '8546',
  '--ws',
  '--ws.addr', eth0Address,
  '--ws.port', '8548',
	'--port', '30304',
	'--nodiscover',
	'--syncmode', 'full',
	'--networkid', sidechainNetworkId + '',
	'--allow-insecure-unlock',
	'--unlock', '0x' + accountRinkebyJson.address,
	'--password', './password',
].concat(isMiner ? [
  '--mine',
	'--miner.threads', '1',
	'--miner.etherbase', '0x' + accountRinkebyJson.address,
	'--miner.gasprice', '0',
	'--miner.gaslimit', '1000000000',
] : []));
cpSidechain.stdout.pipe(process.stdout);
cpSidechain.stderr.pipe(process.stderr);
cpSidechain.stdout.pipe(fs.createWriteStream('./rinkeby-stdout.log', {
  flags: 'a',
}));
cpSidechain.stderr.pipe(fs.createWriteStream('./rinkeby-stderr.log', {
  flags: 'a',
}));

// geth --datadir mainnet init genesis-mainnet.json
// cp ./static-nodes-mainnet.json ./mainnet/static-nodes.json
// cp ./account-mainnet.json ./mainnet/keystore/UTC--2021-01-20T03-14-48.452051307Z--aae22cabdb635d6bfa1f6d19f921c783c90540c2
// geth --datadir mainnet --http --http.addr 172.31.2.5 --http.corsdomain '*' --mine --minerthreads 1 --miner.gasprice 0 --targetgaslimit '1000000000' --syncmode full --networkid 1338 --etherbase '0xaae22cabdb635d6bfa1f6d19f921c783c90540c2' --allow-insecure-unlock --unlock '0xaae22cabdb635d6bfa1f6d19f921c783c90540c2' --password ./password
const cpMainnet = childProcess.spawn('geth', [
  '--datadir', 'mainnet',
	'--http',
	'--http.addr', eth0Address,
	'--http.corsdomain', '*',
	'--http.port', '8545',
  '--ws',
  '--ws.addr', eth0Address,
  '--ws.port', '8547',
	'--port', '30303',
	'--nodiscover',
	'--syncmode', 'full',
	'--networkid', mainnetNetworkId + '',
	'--allow-insecure-unlock',
	'--unlock', '0x' + accountMainnetJson.address,
	'--password', './password',
].concat(isMiner ? [
  '--mine',
	'--miner.threads', '1',
	'--miner.etherbase', '0x' + accountMainnetJson.address,
	'--miner.gasprice', '0',
	'--miner.gaslimit', '1000000000',
] : []));
cpMainnet.stdout.pipe(process.stdout);
cpMainnet.stderr.pipe(process.stderr);
cpMainnet.stdout.pipe(fs.createWriteStream('./mainnet-stdout.log', {
  flags: 'a',
}));
cpMainnet.stderr.pipe(fs.createWriteStream('./mainnet-stderr.log', {
  flags: 'a',
}));

const childProcesses = [
  cpSidechain,
  cpMainnet,
];

[
  'SIGINT',
  'SIGTERM',
].forEach(s => {
  process.on(s, async signal => {
		for (const cp of childProcesses) {
	    cp.kill(s);

      await waitForKill(cp);
	  }
	});
});

function waitForKill(childProcess, cycle = 100) {
  let resolve;
  const promise = new Promise(r => resolve = r);

  setInterval(() => {
    try {
      process.kill(cp.pid, 0);
    } catch(e) {
      resolve();
    }
  }, cycle);

  return promise;
}

This repo containerizes the Ethereum example. The goal is quickly setup a private Ethereum blockchain using Docker and Kubernetes.

Support Feature:
* Private network chain.
* Miner monitoring.
* Blockchain stats dashboard.
* Solidity browser service.

### Requirements
* Docker engine.
* Kubernetes cluster.

Developer Setup:
* https://www.trufflesuite.com/ganache
* https://metamask.io/

## Usage
To run the Ethereum private chain cluster(without the Ethereum network status):
```sh
$ kubectl apply \
-f geth-config.yml \
-f geth-svc.yml \
-f geth-ds.yml
```

Check the pods:
```sh
$  kubectl get po,svc -o wide
NAME            READY     STATUS    RESTARTS   AGE       IP            NODE
po/geth-289mg   2/2       Running   0          10m       10.244.52.3   node4
po/geth-fqszz   2/2       Running   0          10m       10.244.96.2   node1
po/geth-hxlf2   2/2       Running   0          10m       10.244.85.4   node3
po/geth-vjtpf   2/2       Running   0          10m       10.244.98.3   node2

NAME             CLUSTER-IP        EXTERNAL-IP   PORT(S)    AGE       SELECTOR
svc/geth         192.168.170.219   <none>        8545/TCP   4h        app=geth
```

Attach the Ethereum IPC file(Install geth from [Building-Ethereum](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum)):
```sh
$ cd /var/geth && ls
geth  geth.ipc  keystore

$ geth attach ipc:geth.ipc
Welcome to the Geth JavaScript console!

instance: Geth/v1.6.7-unstable/linux-amd64/go1.7.3
coinbase: 0x2f99300b9fb9da018e7004e448f0a16730dbe6a4
at block: 0 (Thu, 01 Jan 1970 00:00:00 UTC)
 datadir: /var/geth
 modules: admin:1.0 debug:1.0 eth:1.0 miner:1.0 net:1.0 personal:1.0 rpc:1.0 txpool:1.0 web3:1.0

> net.peerCount
3
```


# Go-Ethereum Server

Run your own proof-of-stake ethereum-based blockchain nodes!

To start a mining node, you must be an authorized miner address with a certificate installed in the `geth` data directory.

To validate/replicate/sync you don't need any keys.

## Connecting To An Existing Network

There are currently 4 chains that we use:

- `mainnet` (ETH mainnet)
- `mainnetsidechain` (our Geth nodes)
- `testnet` (ETH Rinkeby)
- `testnetsidechain` (our Geth nodes)

`mainnetsidechain`: http://ethereum1.example.org:8545 chainId 1338 
`testnetsidechain`: http://ethereum1.example.org:8546 chainId 1337

You can put these details into MetaMask directly to interact with the chains. There are no gas fees.

These networks also have HTTPS proxy support for secure frontend development:

https://mainnetsidechain.example.org
https://testnetsidechain.example.org

Note that the port on these is the standard HTTPS port, `443`.

## Creating Your Own Blockchain
TODO

## Setting Up a Mainnet Validation Node

Here is how to bootstrap a mainnet validation node:

```bash
geth --datadir mainnet init genesis-mainnet.json
cp ./static-nodes-mainnet.json ./mainnet/static-nodes.json
cp account-mainnet.json ./mainnet/keystore/UTC--2021-02-17T10-32-36.272770958Z--bb0827ee9b0b459e1b5dd6dbea0f55bf578dbbd2
geth --datadir mainnet --http --http.addr 172.31.2.5 --http.corsdomain '*' --syncmode full --networkid 1338
```

`static-nodes-mainnet.json`` has some bootstrap nodes listed so you should be able to start syncing from those. Your chain will be "reorganized" a lot while you sync up, which is normal.

## Note on Saving Data

Replication is accomplished by having multiple nodes mine on that address at the same time.

`geth` does _not_ stream blocks to disk eagerly. A system crash will lose blocks on that node, though other miners will not be affected.

## Restarting Geth Nodes (Where You Control the Master Node)

Therefore it is important that any restart of these nodes follows the correct order:

```
for (i in [2, 3, 1]) { // order matters
1. shut down node i with SIGTERM
2. make sure node i saved its state in the logs
3. start node i again
4. ensure node i is replicating and synced and do not proceed unless it is
```

## Cross-chain transfers

There are two parallel blockchains for each Ethereum source of truth. There are two sources of truth (mainnet and testnet) and they do not interact. Therefore there are 4 chains.

```
mainnet
mainnetsidechain
testnet
testnetsidechain
```

The common case is `mainnet` (ETH) and `mainnetsidechain` (our `geth`).

They talk to each other via a signature scheme enforced in the contracts. Basically, each contract is deployed twice, once on each chain. We mint on the side chain usually (enforced by constructor arguments). Transfers occur via assignment of the asset away from the user to the contract's address, logging a deposit event on the sidechain. The client then asks the signing server to read the sidechain, and sign off on the fact that this deposit ocurred. If successful the signature is sent back to the client. The client then takes that signature and submits it in a mainnet transaction. This must be confirmed by the user in metamask.

If the user accepts, the mainnet should accept teh signature and assign ownership of the asset to the user on mainnet.

If the user does not accept then the asset is stuck in between. The way to fix this is to continue the transfer from the part where you ask the signing server for the signature.

The way back from mainnet to mainnetsidechain is the same procedure, except with contracts switched. You would first write to the mainnet to move the mainnet asset to the mainnet contract (requires user confirmation). Once this succeeds you can ask the signing server for the signature (uses a differnt endpoint than last time). Then that signature can be written to the sidechain to have the contract give you back the asset that you initially deposited. At this point we are back where we started and the procedure could be repeated.

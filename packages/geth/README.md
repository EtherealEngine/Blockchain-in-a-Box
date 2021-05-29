# ethereum-backend

The Webaverse Ethereum backend consists of a side chain that we mine using Proof-of-Stake.

To start a mining node, you must be an authorized miner address with a certificate installed in the `geth` data directory -- ask Avaer for the keys.

To validate/replicate/sync you don't need any keys.

## commands

Here is how to bootstrap a mainnet validation node:

```bash
geth --datadir mainnet init genesis-mainnet.json
cp ./static-nodes-mainnet.json ./mainnet/static-nodes.json
cp account-mainnet.json ./mainnet/keystore/UTC--2021-02-17T10-32-36.272770958Z--bb0827ee9b0b459e1b5dd6dbea0f55bf578dbbd2
geth --datadir mainnet --http --http.addr 172.31.2.5 --http.corsdomain '*' --syncmode full --networkid 1338
```

`static-nodes-mainnet.json`` has some bootstrap nodes listed so you should be able to start syncing from those. Your chain will be "reorganized" a lot while you sync up, which is normal.

## blockchains

There are currently 4 chains that we use:

- `mainnet` (ETH mainnet)
- `mainnetsidechain` (our Geth nodes)
- `rinkeby` (ETH Rinkeby)
- `rinkebysidechain` (our Geth nodes)

`mainnetsidechain`: http://ethereum1.exokit.org:8545 chainId 1338 
`rinkebysidechain`: http://ethereum1.exokit.org:8546 chainId 1337

You can put these details into MetaMask directly to interact with the chains. There are no gas fees.

These networks also have HTTPS proxy support for secure frontend development:

https://mainnetsidechain.exokit.org
https://rinkebysidechain.exokit.org

Note that the port on these is the standard HTTPS port, `443`.

## contracts

The contracts we deploy onto all chains are available at https://github.com/webaverse/contracts.

## note on atomic saves

Replication is accomplished by having multiple nodes mine on that address at the same time.

`geth` does _not_ stream blocks to disk eagerly. A system crash will lose blocks on that node, though other miners will not be affected.

## restarting geth servers

Therefore it is important that any restart of these nodes follows the correct order:

```
for (i in [2, 3, 1]) { // order matters
1. shut down node i with SIGTERM
2. make sure node i saved its state in the logs
3. start node i again
4. ensure node i is replicating and synced and do not proceed unless it is
```

## how transfers work

There are two parallel blockchains for each Ethereum source of truth. There are two sources of truth (mainnet and rinkeby) and they do not interact. Therefore there are 4 chains.

```
mainnet
mainnetsidechain
rinkeby
rinkebysidechain
```

The common case is `mainnet` (ETH) and `mainnetsidechain` (our `geth`).

They talk to each other via a signature scheme enforced in the contracts. Basically, each contract is deployed twice, once on each chain. We mint on the side chain usually (enforced by constructor arguments). Transfers occur via assignment of the token away from the user to the contract's address, logging a deposit event on the sidechain. The client then asks the signing server to read the sidechain, and sign off on the fact that this deposit ocurred. If successful the signature is sent back to the client. The client then takes that signature and submits it in a mainnet transaction. This must be confirmed by the user in metamask.

If the user accepts, the mainnet should accept teh signature and assign ownership of the token to the user on mainnet.

If the user does not accept then the token is stuck in between. The way to fix this is to continue the transfer from the part where you ask the signing server for the signature.

The way back from mainnet to mainnetsidechain is the same procedure, except with contracts switched. You would first write to the mainnet to move the mainnet token to the mainnet contract (requires user confirmation). Once this succeeds you can ask the signing server for the signature (uses a differnt endpoint than last time). Then that signature can be written to the sidechain to have the contract give you back the token that you initially deposited. At this point we are back where we started and the procedure could be repeated.

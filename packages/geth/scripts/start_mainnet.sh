#!/bin/bash
geth --datadir mainnet init genesis-mainnet.json
cp ./static-nodes-mainnet.json ./mainnet/static-nodes.json
cp account-mainnet.json ./mainnet/keystore/UTC--2021-02-17T10-32-36.272770958Z--bb0827ee9b0b459e1b5dd6dbea0f55bf578dbbd2
geth --datadir mainnet --http --http.addr 172.31.2.5 --http.corsdomain '*' --syncmode full --networkid 1338
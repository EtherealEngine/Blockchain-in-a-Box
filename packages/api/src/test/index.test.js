const request = require("supertest");
const jwt = require("jsonwebtoken");
const { hdkey } = require("ethereumjs-wallet");
const bip39 = require("bip39");

const { app } = require("../index");
const { Readable } = require("stream");
const { ResponseStatus } = require("../v1/enums.js");
const {
  getBlockchain,
  runSidechainTransaction,
} = require("../common/blockchain.js");
const { makePromise, setCorsHeaders } = require("../common/utils.js");
const {
  getRedisItem,
  parseRedisItems,
  getRedisClient,
} = require("../common/redis.js");
const {
  redisPrefixes,
  mainnetSignatureMessage,
  assetIndexName,
  burnAddress,
  zeroAddress,
} = require("../common/constants.js");
const {
  PRODUCTION,
  DEVELOPMENT,
  PINATA_API_KEY,
  PINATA_SECRET_API_KEY,
  MINTING_FEE,
  MAINNET_MNEMONIC,
} = require("../common/environment.js");
const pinataSDK = require("@pinata/sdk");
const pinata =
  PINATA_API_KEY && PINATA_API_KEY !== ""
    ? pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY)
    : null;

const pinataOptions = {
  pinataOptions: {
    customPinPolicy: {
      regions: [
        {
          id: "FRA1",
          desiredReplicationCount: 1,
        },
        {
          id: "NYC1",
          desiredReplicationCount: 2,
        },
      ],
    },
  },
};

let blockchain;

(async () => {
  blockchain = await getBlockchain();
})();
const network = PRODUCTION ? "mainnet" : "testnet";
const redisClient = getRedisClient();

// async function mintAssets(resHash, mnemonic, quantity, blockchain) {
//   let assetIds, status;
//   const { web3, contracts } = blockchain;
//   let network = "mainnetsidechain";
//   if (DEVELOPMENT) {
//     network = "testnetsidechain";
//   }

//   const fullAmount = {
//     t: "uint256",
//     v: new web3[network].utils.BN(1e9)
//       .mul(new web3[network].utils.BN(1e9))
//       .mul(new web3[network].utils.BN(1e9)),
//   };

//   const fullAmountD2 = {
//     t: "uint256",
//     v: fullAmount.v.div(new web3[network].utils.BN(2)),
//   };
//   const wallet = hdkey
//     .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic.correct))
//     .derivePath(`m/44'/60'/0'/0/0`)
//     .getWallet();
//   const address = wallet.getAddressString();

//   if (MINTING_FEE > 0) {
//     let allowance = await contracts[network]["Currency"].methods
//       .allowance(address, contracts[network]["Inventory"]._address)
//       .call();
//     allowance = new web3[network].utils.BN(allowance, 0);
//     if (allowance.lt(fullAmountD2.v)) {
//       const result = await runSidechainTransaction(mnemonic.correct)(
//         "Currency",
//         "approve",
//         contracts[network]["Inventory"]._address,
//         fullAmount.v
//       );
//       status = result.status;
//     } else {
//       status = true;
//     }
//   } else status = true;

//   if (status) {
//     const description = ;

//     let fileName = resHash.split("/").pop();

//     let extName = path.extname(fileName).slice(1);
//     extName = extName === "" ? "png" : extName;
//     extName = extName === "jpeg" ? "jpg" : extName;

//     fileName = extName ? fileName.slice(0, -(extName.length + 1)) : fileName;

//     const { hash } = JSON.parse(Buffer.from(resHash, "utf8").toString("utf8"));

//     const result = await runSidechainTransaction(mnemonic.correct)(
//       "Inventory",
//       "mint",
//       address,
//       hash,
//       fileName,
//       extName,
//       description,
//       quantity
//     );
//     status = result.status;

//     const assetId = new web3[network].utils.BN(
//       result.logs[0].topics[3].slice(2),
//       16
//     ).toNumber();
//     assetIds = [assetId, assetId + quantity - 1];
//   }
//   return assetIds;
// }


////////////////////////////////////////////////////////

describe("POST /api/v1/authorizeServer", () => {
  const authSecretKey = {
    wrong: "aaaaaaaaa",
    correct: process.env.AUTH_SECRET_KEY,
  };
  test("rejects requests with no authSecretKey", async () => {
    await request(app)
      .post("/api/v1/authorizeServer")
      .expect((res) => {
        expect(res.body.error).toEqual("authSecretKey value was not found");
        expect(res.body.status).toEqual(ResponseStatus.Error);
        expect(res.body.accessToken).toEqual(null);
      })
      .expect(200);
  });

  test("reject requests with invalid authSecretKey", async () => {
    await request(app)
      .post("/api/v1/authorizeServer")
      .send({ authSecretKey: authSecretKey.wrong })
      .expect((res) => {
        expect(res.body.error).toEqual("authSecretKey value was invalid");
        expect(res.body.status).toEqual(ResponseStatus.Error);
        expect(res.body.accessToken).toEqual(null);
      })
      .expect(200);
  });

  //   test("returns a valid auth token", async () => {
  //     await request(app)
  //       .post("/api/v1/authorizeServer")
  //       .send({ authSecretKey: authSecretKey.correct })
  //       .expect((res) => {
  //         const accessToken = jwt.sign(
  //           { authSecretKey: authSecretKey.correct },
  //           process.env.AUTH_TOKEN_SECRET
  //         );
  //         expect(res.body.error).toEqual(null);
  //         expect(res.body.status).toEqual(ResponseStatus.Success);
  //         expect(res.body.accessToken).toEqual(accessToken);
  //       })
  //       .expect(200);
  //   });
});

/////////////////////////////////////////////////////////

describe("POST /api/v1/wallet", () => {
  //   const accessToken = {
  //     wrong: "bearer aaa",
  //     correct: jwt.sign({ authSecretKey }, process.env.AUTH_TOKEN_SECRET),
  //   };
  //   test("rejects requests with no token", async () => {
  //     await request(app)
  //       .post("/api/v1/wallet")
  //       .expect((res) => {})
  //       .expect(401);
  //   });
  //   test("rejects requests with wrong token", async () => {
  //     await request(app)
  //       .post("/api/v1/wallet")
  //       .head(authorization, accessToken.wrong)
  //       .expect((res) => {})
  //       .expect(403);
  //   });

  test("returns a valid wallet address", async () => {
    await request(app)
      .post("/api/v1/wallet")
      //   .head('authorization', accessToken.correct)
      .expect((res) => {
        const wallet = hdkey
          .fromMasterSeed(bip39.mnemonicToSeedSync(res.body.userMnemonic))
          .derivePath(`m/44'/60'/0'/0/0`)
          .getWallet();
        const userAddress = wallet.getAddressString();
        expect(res.body.status).toEqual(ResponseStatus.Success);
        expect(res.body.userMnemonic).toBeTruthy();
        expect(res.body.userAddress).toEqual(userAddress);
        expect(res.body.error).toEqual(null);
      })
      .expect(200);
  });
});

/////////////////////////////////////////////////////////

describe("GET /api/v1/assets/:address/:mainnetAddress?", () => {
  //   const accessToken = {
  //     wrong: "bearer aaa",
  //     correct: jwt.sign({ authSecretKey }, process.env.AUTH_TOKEN_SECRET),
  //   };
  //   test("rejects requests with no token", async () => {
  //     await request(app)
  //       .post("/api/v1/wallet")
  //       .expect((res) => {})
  //       .expect(401);
  //   });
  //   test("rejects requests with wrong token", async () => {
  //     await request(app)
  //       .post("/api/v1/wallet")
  //       .head(authorization, accessToken.wrong)
  //       .expect((res) => {})
  //       .expect(403);
  //   });

  const address = {
    wrong: "",
    corrent: "",
  };
  const mainnetAddress = {
    wrong: "",
    correct: "",
  };

  test("rejects requests with wrong address", async () => {
    await request(app)
      .get(`/api/v1/assets/${address.wrong}`)
      //   .head('authorization', accessToken.correct)
      .expect((res) => {
        expect(res.body.status).toEqual(ResponseStatus.Error);
        expect(res.body.assets).toEqual(null);
        expect(res.body.error).toBeTruthy();
      })
      .expect(200);
  });

  test("rejects requests with wrong mainnetAddress", async () => {
    await request(app)
      .get(`/api/v1/assets/${address.wrong}/${mainnetAddress.wrong}`)
      //   .head('authorization', accessToken.correct)
      .expect((res) => {
        expect(res.body.status).toEqual(ResponseStatus.Error);
        expect(res.body.assets).toEqual(null);
        expect(res.body.error).toBeTruthy();
      })
      .expect(200);
  });

  test("returns a assets list with a correct address and a correct mainnetAddress", async () => {
    try {
      const [mainnetAssets, sidechainAssets] = await Promise.all([
        (async () => {
          if (!mainnetAddress.correct) return [];
          const recoveredAddress = await blockchain.web3[
            network
          ].eth.accounts.recover(
            mainnetSignatureMessage,
            mainnetAddress.correct
          );
          if (!recoveredAddress) return [];
          const p = makePromise();
          const args = `${assetIndexName} ${JSON.stringify(
            recoveredAddress
          )} INFIELDS 1 currentOwnerAddress LIMIT 0 1000000`
            .split(" ")
            .concat([
              (err, result) => {
                if (!err) {
                  const items = parseRedisItems(result);
                  p.accept({
                    Items: items,
                  });
                } else {
                  p.reject(err);
                }
              },
            ]);
          redisClient.ft_search.apply(redisClient, args);
          const o = await p;

          return (o && o.Items) || [];
        })(),
        (async () => {
          const p = makePromise();
          const args = `${assetIndexName} ${JSON.stringify(
            address.correct
          )} INFIELDS 1 currentOwnerAddress LIMIT 0 1000000`
            .split(" ")
            .concat([
              (err, result) => {
                if (!err) {
                  const items = parseRedisItems(result);
                  p.accept({
                    Items: items,
                  });
                } else {
                  p.reject(err);
                }
              },
            ]);
          redisClient.ft_search.apply(redisClient, args);
          const o = await p;
          return (o && o.Items) || [];
        })(),
      ]);
      const assets = sidechainAssets
        .concat(mainnetAssets)
        .sort((a, b) => a.id - b.id)
        .filter((asset, i) => {
          // filter unique hashes
          if (
            asset === "0" ||
            (asset.properties.hash === "" &&
              asset.owner.address === zeroAddress)
          )
            return false;

          for (let j = 0; j < i; j++) {
            if (
              assets[j].properties.hash === asset.properties.hash &&
              asset.properties.hash !== ""
            )
              return false;
          }
          return true;
        });
      await request(app)
        .get(`/api/v1/assets/${address.correct}/${mainnetAddress.correct}`)
        //   .head('authorization', accessToken.correct)
        .expect((res) => {
          expect(res.body.status).toEqual(ResponseStatus.Success);
          expect(res.body.assets).toEqual(JSON.stringify(assets));
          expect(res.body.error).toEqual(null);
        })
        .expect(200);
    } catch (error) {
      await request(app)
        .get(`/api/v1/assets/${address.correct}/${mainnetAddress.correct}`)
        //   .head('authorization', accessToken.correct)
        .expect((res) => {
          expect(res.body.status).toEqual(ResponseStatus.Error);
          expect(res.body.assets).toEqual(null);
          expect(res.body.error).toEqual(error);
        })
        .expect(200);
    }
  });

  test("returns a assets list with a correct address", async () => {
    try {
      const [mainnetAssets, sidechainAssets] = await Promise.all([
        (async () => {
          return [];
        })(),
        (async () => {
          const p = makePromise();
          const args = `${assetIndexName} ${JSON.stringify(
            address.correct
          )} INFIELDS 1 currentOwnerAddress LIMIT 0 1000000`
            .split(" ")
            .concat([
              (err, result) => {
                if (!err) {
                  const items = parseRedisItems(result);
                  p.accept({
                    Items: items,
                  });
                } else {
                  p.reject(err);
                }
              },
            ]);
          redisClient.ft_search.apply(redisClient, args);
          const o = await p;
          return (o && o.Items) || [];
        })(),
      ]);
      const assets = sidechainAssets
        .concat(mainnetAssets)
        .sort((a, b) => a.id - b.id)
        .filter((asset, i) => {
          // filter unique hashes
          if (
            asset === "0" ||
            (asset.properties.hash === "" &&
              asset.owner.address === zeroAddress)
          )
            return false;

          for (let j = 0; j < i; j++) {
            if (
              assets[j].properties.hash === asset.properties.hash &&
              asset.properties.hash !== ""
            )
              return false;
          }
          return true;
        });
      await request(app)
        .get(`/api/v1/assets/${address.correct}`)
        //   .head('authorization', accessToken.correct)
        .expect((res) => {
          expect(res.body.status).toEqual(ResponseStatus.Success);
          expect(res.body.assets).toEqual(JSON.stringify(assets));
          expect(res.body.error).toEqual(null);
        })
        .expect(200);
    } catch (error) {
      await request(app)
        .get(`/api/v1/assets/${address.correct}`)
        //   .head('authorization', accessToken.correct)
        .expect((res) => {
          expect(res.body.status).toEqual(ResponseStatus.Error);
          expect(res.body.assets).toEqual(null);
          expect(res.body.error).toEqual(error);
        })
        .expect(200);
    }
  });
});

/////////////////////////////////////////////////////////

describe("GET /api/v1/asset/:assetId", () => {
  //   const accessToken = {
  //     wrong: "bearer aaa",
  //     correct: jwt.sign({ authSecretKey }, process.env.AUTH_TOKEN_SECRET),
  //   };
  //   test("rejects requests with no token", async () => {
  //     await request(app)
  //       .post("/api/v1/wallet")
  //       .expect((res) => {})
  //       .expect(401);
  //   });
  //   test("rejects requests with wrong token", async () => {
  //     await request(app)
  //       .post("/api/v1/wallet")
  //       .head(authorization, accessToken.wrong)
  //       .expect((res) => {})
  //       .expect(403);
  //   });

  const assetId = {
    wrong: "",
    corrent: "",
  };

  test("rejects requests with wrong assetId", async () => {
    await request(app)
      .get(`/api/v1/assets/${assetId.wrong}`)
      //   .head('authorization', accessToken.correct)
      .expect((res) => {
        expect(res.body.status).toEqual(ResponseStatus.Error);
        expect(res.body.asset).toEqual(null);
        expect(res.body.error).toEqual("The asset could not be found");
      })
      .expect(200);
  });

  test("returns a asset with a correct assetId", async () => {
    let o = await getRedisItem(
      assetId.correct,
      redisPrefixes.mainnetSidechainAsset
    );
    let asset = o.Item;

    await request(app)
      .get(`/api/v1/asset/${assetId.correct}`)
      //   .head('authorization', accessToken.correct)
      .expect((res) => {
        expect(res.body.status).toEqual(ResponseStatus.Success);
        expect(res.body.asset).toEqual(asset);
        expect(res.body.error).toEqual(null);
      })
      .expect(200);
  });
});

/////////////////////////////////////////////////////////

describe("GET /api/v1/asset/:assetId", () => {
  //   const accessToken = {
  //     wrong: "bearer aaa",
  //     correct: jwt.sign({ authSecretKey }, process.env.AUTH_TOKEN_SECRET),
  //   };
  //   test("rejects requests with no token", async () => {
  //     await request(app)
  //       .post("/api/v1/wallet")
  //       .expect((res) => {})
  //       .expect(401);
  //   });
  //   test("rejects requests with wrong token", async () => {
  //     await request(app)
  //       .post("/api/v1/wallet")
  //       .head(authorization, accessToken.wrong)
  //       .expect((res) => {})
  //       .expect(403);
  //   });

  const invalid_ranges = [
    {
      assetStartId: 0,
      assetEndId: 10,
    },
    {
      assetStartId: 11,
      assetEndId: 10,
    },
    {
      assetStartId: 1,
      assetEndId: 120,
    },
    {
      assetStartId: "Sdfs",
      assetEndId: 10,
    },
    {
      assetStartId: 1,
      assetEndId: "Sdf",
    },
    {
      assetStartId: "Sdf",
      assetEndId: "Sdf",
    },
  ];

  //should replace these fields

  const correct_range = {
    assetStartId: 1,
    assetEndId: 10,
  };

  invalid_ranges.forEach((ele) => {
    test("rejects requests with invalid range", async () => {
      await request(app)
        .get(`/api/v1/asset/${ele.assetStartId}/${ele.assetEndId}`)
        //   .head('authorization', accessToken.correct)
        .expect((res) => {
          expect(res.body.status).toEqual(ResponseStatus.Error);
          expect(res.body.error).toEqual("Invalid range for assets");
        })
        .expect(200);
    });
  });

  test("returns a asset with a correct assetId", async () => {
    try {
      const promise = makePromise();
      const args =
        `${assetIndexName} * filter id ${correct_range.assetStartId} ${correct_range.assetEndId} LIMIT 0 1000000`
          .split(" ")
          .concat([
            (err, result) => {
              if (!err) {
                const items = parseRedisItems(result);
                promise.accept({
                  Items: items,
                });
              } else {
                promise.reject(err);
              }
            },
          ]);
      redisClient.ft_search.apply(redisClient, args);
      const o = await promise;

      let assets = o.Items.filter((asset) => asset !== null)
        .sort((a, b) => a.id - b.id)
        .filter((asset, i) => {
          // filter unique hashes

          if (
            asset.properties.hash === "" &&
            asset.owner.address === zeroAddress
          )
            return false;

          for (let j = 0; j < i; j++)
            if (
              assets[j].properties.hash === asset.properties.hash &&
              asset.properties.hash !== ""
            )
              return false;

          return true;
        });

      await request(app)
        .get(
          `/api/v1/asset/${correct_range.assetStartId}/${correct_range.assetEndId}`
        )
        //   .head('authorization', accessToken.correct)
        .expect((res) => {
          expect(res.body.status).toEqual(ResponseStatus.Success);
          expect(res.body.assets).toEqual(assets);
          expect(res.body.error).toEqual(null);
        })
        .expect(200);
    } catch (error) {
      await request(app)
        .get(
          `/api/v1/asset/${correct_range.assetStartId}/${correct_range.assetEndId}`
        )
        //   .head('authorization', accessToken.correct)
        .expect((res) => {
          expect(res.body.status).toEqual(ResponseStatus.Error);
          expect(res.body.assets).toEqual([]);
          expect(res.body.error).toEqual(error);
        })
        .expect(200);
    }
  });
});

/////////////////////////////////////////////////////////
// not finished yet


describe("POST /api/v1/asset", () => {
  //   const accessToken = {
  //     wrong: "bearer aaa",
  //     correct: jwt.sign({ authSecretKey }, process.env.AUTH_TOKEN_SECRET),
  //   };
  //   test("rejects requests with no token", async () => {
  //     await request(app)
  //       .post("/api/v1/wallet")
  //       .expect((res) => {})
  //       .expect(401);
  //   });
  //   test("rejects requests with wrong token", async () => {
  //     await request(app)
  //       .post("/api/v1/wallet")
  //       .head(authorization, accessToken.wrong)
  //       .expect((res) => {})
  //       .expect(403);
  //   });

  const mnemonic = {
      wrong: "",
      correct: "",
    },
    quantity = 2,
    resourceHash = "xvxcv";
  const file = {
    wrong: __dirname + "/hash/wrong.hash",
    correct: __dirname + "/hash/correct.hash",
  };

  test("rejects requests with invalid mnemonic", async () => {
    await request(app)
      .post(`/api/v1/asset`)
      .field("mnemonic", mnemonic.wrong)
      .field("quantity", quantity)
      .field("resourceHash", resourceHash.correct)
      .attach("file", file.correct)
      //   .head('authorization', accessToken.correct)
      .expect((res) => {
        expect(res.body.status).toEqual(ResponseStatus.Error);
        expect(res.body.error).toEqual("Invalid mnemonic");
      })
      .expect(200);
  });

  test("rejects requests with empty resource hash", async () => {
    await request(app)
      .post(`/api/v1/asset`)
      .field("mnemonic", mnemonic.correct)
      .field("quantity", quantity)
      //   .head('authorization', accessToken.correct)
      .expect((res) => {
        expect(res.body.status).toEqual(ResponseStatus.Error);
        expect(res.body.error).toEqual(
          "POST did not include a file or resourceHash"
        );
      })
      .expect(200);
  });

  test("rejects requests with both of hash and file", async () => {
    await request(app)
      .post(`/api/v1/asset`)
      .field("mnemonic", mnemonic.correct)
      .field("quantity", quantity)
      .field("resourceHash", resourceHash.correct)
      .attach("file", file.correct)
      //   .head('authorization', accessToken.correct)
      .expect((res) => {
        expect(res.body.status).toEqual(ResponseStatus.Error);
        expect(res.body.error).toEqual(
          "POST should include a resourceHash *or* file but not both"
        );
      })
      .expect(200);
  });

  test("rejects requests with a wrong file", async () => {
    await request(app)
      .post(`/api/v1/asset`)
      .field("mnemonic", mnemonic.correct)
      .field("quantity", quantity)
      .attach("file", file.wrong)
      //   .head('authorization', accessToken.correct)
      .expect((res) => {
        expect(res.body.status).toEqual(ResponseStatus.Error);
        expect(res.body.error).toEqual(
          "Error pinning to Pinata service, hash was not returned"
        );
      })
      .expect(200);
  });

  test("create an asset with a correct resourceHash", async () => {
    // try {
    //   const assetIds = mintAssets(resourceHash, mnemonic, quantity, blockchain);
      await request(app)
        .post(`/api/v1/asset`)
        .field("mnemonic", mnemonic.correct)
        .field("quantity", quantity)
        .field("resourceHash", resourceHash)
        //   .head('authorization', accessToken.correct)
        .expect((res) => {
          expect(res.body.status).toEqual(ResponseStatus.Success);
          expect(res.body.error).toEqual(null);
          expect(res.body.assetIds).toBeTruthy();
        })
        .expect(200);
    // } catch (error) {
    //   await request(app)
    //     .post(`/api/v1/asset`)
    //     .field("mnemonic", mnemonic.correct)
    //     .field("quantity", quantity)
    //     .field("resourceHash", resourceHash)
    //     //   .head('authorization', accessToken.correct)
    //     .expect((res) => {
    //       expect(res.body.status).toEqual(ResponseStatus.Error);
    //       expect(res.body.error).toEqual(error);
    //       expect(res.body.assetIds).toEqual([]);
    //     })
    //     .expect(200);
    // }
  });

  test("create an asset with a correct file", async () => {
    // try {
      // const readableStream = new Readable({
      //   read() {
      //     this.push(Buffer.from(file));
      //     this.push(null);
      //   },
      // });
      // const { IpfsHash } = pinata.pinFileToIPFS(readableStream, pinataOptions);
      
      // const assetIds = mintAssets(IpfsHash, mnemonic, quantity, blockchain);
      await request(app)
        .post(`/api/v1/asset`)
        .field("mnemonic", mnemonic.correct)
        .field("quantity", quantity)
        .attach("file", file.correct)
        //   .head('authorization', accessToken.correct)
        .expect((res) => {
          expect(res.body.status).toEqual(ResponseStatus.Success);
          expect(res.body.error).toEqual(null);
          expect(res.body.assetIds).toBeTruthy();
        })
        .expect(200);
    // } catch (error) {
    //   await request(app)
    //     .post(`/api/v1/asset`)
    //     .field("mnemonic", mnemonic.correct)
    //     .field("quantity", quantity)
    //     .attach("file", file.correct)
    //     //   .head('authorization', accessToken.correct)
    //     .expect((res) => {
    //       expect(res.body.status).toEqual(ResponseStatus.Error);
    //       expect(res.body.error).toEqual(error);
    //       expect(res.body.assetIds).toEqual([]);
    //     })
    //     .expect(200);
    // }
  });
});

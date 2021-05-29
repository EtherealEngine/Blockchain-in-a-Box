const blockchain = require('./blockchain.js');
const {ddb} = require('./aws.js');
const {tableNames} = require('./constants.js');

const keyName = 'test-users.cache';

const _makePromise = () => {
  let accept, reject;
  const p = new Promise((a, r) => {
    accept = a;
    reject = r;
  });
  p.accept = accept;
  p.reject = reject;
  return p;
};

const MAX_CACHED_USERS = 5;
class AccountManager {
  constructor() {
    this.users = [];
    this.queue = [];

    this.load();
  }
  async load() {
    const tokenItem = await ddb.getItem({
      TableName: tableNames.user,
      Key: {
        email: {S: keyName},
      }
    }).promise();
    this.users = tokenItem.Item ? JSON.parse(tokenItem.Item.users.S) : [];
    // console.log('got old', this.users);

    const _save = async () => {
      await ddb.putItem({
        TableName: tableNames.user,
        Item: {
          email: {S: keyName},
          users: {S: JSON.stringify(this.users)},
        }
      }).promise();
    };
    const _flush = async () => {
      while (this.queue.length > 0 && this.users.length > 0) {
        this.queue.shift()(this.users.shift());
      }
      await _save();
    };
    await _flush();

    const _recurse = async () => {
      while (this.users.length < MAX_CACHED_USERS) {
        const mnemonic = blockchain.makeMnemonic();
        const userKeys = await blockchain.genKeys(mnemonic);
        const address = await blockchain.createAccount(userKeys, {
          bake: true,
        });
        userKeys.mnemonic = mnemonic;
        userKeys.address = address;

        this.users.push(userKeys);
        await _flush();
      }
      setTimeout(_recurse, 1000);
    };
    setTimeout(_recurse, 1000);
  }
  async getAccount() {
    if (this.users.length > 0) {
      return this.users.shift();
    } else {
      const p = _makePromise();
      this.queue.push(p.accept);
      return await p;
    }
  }
}
const accountManager = new AccountManager();

module.exports = accountManager;
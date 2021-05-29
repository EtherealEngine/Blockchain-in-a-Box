const events = require('events');
const {EventEmitter} = events;
const blockchain = require('./blockchain.js');
const flowConstants = require('./flow-constants.js');
class EventsManager extends EventEmitter {
  constructor() {
    super();

    let lastCheckedBlock = 0;
    const _recurse = async () => {
      if (blockchain.getIsLoaded()) {
        // console.log('check 1');
        const latestBlock = await blockchain.getLatestBlock();
        // console.log('check 2');
        if (!lastCheckedBlock) {
          lastCheckedBlock = latestBlock;
        }
        if (latestBlock !== lastCheckedBlock) {
          // console.log('check 3');
          const {WebaverseToken, WebaverseNFT, WebaverseAccount} = await flowConstants.load();
          const txs = {};
          const eventTypes = [
            `A.${WebaverseToken.slice(2)}.WebaverseToken.TokensWithdrawn`,
            `A.${WebaverseToken.slice(2)}.WebaverseToken.TokensDeposited`,
            `A.${WebaverseNFT.slice(2)}.WebaverseNFT.Withdraw`,
            `A.${WebaverseNFT.slice(2)}.WebaverseNFT.Deposit`,
            `A.${WebaverseNFT.slice(2)}.WebaverseNFT.MetadataChanged`,
            `A.${WebaverseAccount.slice(2)}.WebaverseAccount.MetadataChanged`,
          ];
          for (const eventType of eventTypes) {
            const events = await blockchain.getEvents(eventType, lastCheckedBlock, latestBlock);
            // console.log('check 4', eventType);
            // console.log('got events', events);
            for (const event of events) {
              const {payload: {value: {fields}}, transactionId} = event;
              /* const amountField = fields.find(field => field.name === 'amount');
              const fromField = fields.find(field => field.name === 'from');
              const toField = fields.find(field => field.name === 'to'); */
              let tx = txs[transactionId];
              if (!tx) {
                tx = {};
                txs[transactionId] = tx;
              }
              for (const field of fields) {
                const value = field.value.type === 'Optional' ? field.value.value : field.value;

                tx[field.name] = value.value;
                if (value.type === 'UFix64') {
                  tx[field.name] = parseFloat(tx[field.name]);
                } else if (value.type === 'UInt64') {
                  tx[field.name] = parseInt(tx[field.name], 10);
                }
              }
              // console.log('got tx', tx, JSON.stringify(event, null, 2));
            }
          }
          // console.log('got txs', txs);
          for (const k in txs) {
            const tx = txs[k];
            console.log('got tx', tx);
            // if (tx.from && tx.to) {
              this.emit('transaction', tx);
              // uiManager.popupMesh.addMessage(`${tx.from} sent ${tx.to} ${tx.amount}`);
            // }
          }
          lastCheckedBlock = latestBlock;
        }
      }
      setTimeout(_recurse, 1000);
    };
    setTimeout(_recurse, 1000);
  }
}
const eventsManager = new EventsManager();

module.exports = eventsManager;
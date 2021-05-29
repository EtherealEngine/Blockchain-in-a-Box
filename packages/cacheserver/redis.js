const stream = require('stream');
const redis = require('redis');
const redisearch = require('redis-redisearch');
redisearch(redis);
const {makePromise} = require('./utils.js');
const {ids, nftIndexName, redisPrefixes} = require('./constants.js');
const {redisKey} = require('./environment.js');

// c = r.createClient(); c.auth('lol', err => {c.hset('cities', 'id', 'A Town Created from Grafting.', err => { c.hget('cities', 'id', console.log); }); c.on('error', console.warn); }); c.ft_create.apply(c, 'idx SCHEMA id TEXT SORTABLE'.split(' ').concat([console.warn])); 1

let redisClient = null;
let loadPromise = null;
const _connectRedis = (port, host) => new Promise((accept, reject) => {
  redisClient = redis.createClient(port, host);
  redisClient.on('error', err => {
    console.warn(err);
  });
  redisClient.auth(redisKey, err => {
    if (!err) {
      const args = `${nftIndexName} PREFIX 1 ${redisPrefixes.mainnetsidechainNft}: SCHEMA id NUMERIC SORTABLE currentOwnerAddress TEXT currentLocation TEXT description TEXT minterAddress TEXT ownerAddress TEXT properties TEXT ext TEXT hash TEXT name TEXT unlockable TEXT`.split(' ');
      console.log('create index 1', args);
      redisClient.ft_create.apply(redisClient, args.concat([err => {
        console.log('create index 2', err);
        /* if (err) { // cache initialization is a soft error
          console.warn('index create error', err);
        } */
        redisClient.on('end', () => {
          redisClient = null;
          
          _connectRedis(port, host);
        });
        
        accept();
      }]));
    } else {
      reject(err);
    }
  });
});
async function connect(port, host) {
  if (!loadPromise) {
    loadPromise = _connectRedis(port, host);
  }
  await loadPromise;
}
function getRedisClient() {
  return redisClient;
}

async function getRedisItem(id, TableName) {
  const p = makePromise();
  redisClient.hgetall(`${TableName}:${id}`, (err, result) => {
    if (!err) {
      for (const k in result) {
        result[k] = JSON.parse(result[k]);
      }
      // console.log('got result', result);
      p.accept({
        Item: result,
      });
    } else {
      p.reject(err);
    }
  }); 
  return await p;
}

async function putRedisItem(id, data, TableName) {
  const args = [
    `${TableName}:${id}`,
  ];
  for (const k in data) {
    args.push(k, JSON.stringify(data[k]));
  }
  // console.log('putting', args);
  const p = makePromise();
  args.push(err => {
    if (!err) {
      // console.log('accept');
      p.accept();
    } else {
      console.warn('error', err);
      p.reject(err);
    }
  });
  redisClient.hmset.apply(redisClient, args); 
  await p;
}

async function getRedisAllItems(TableName = defaultDynamoTable) {
  // console.time('lol 1');
  let keys = await new Promise((accept, reject) => {
    redisClient.keys(`${TableName}:*`, (err, result) => {
      if (!err) {
        accept(result);
      } else {
        reject(err);
      }
    });
  });
  // console.log('got old keys', keys, {lastCachedBlockAccountId: ids.lastCachedBlockAccount});
  const filterKey = `${TableName}:${ids.lastCachedBlockAccount}`;
  keys = keys.filter(key => key !== filterKey);
  // console.timeEnd('lol 1');
  
  // console.time('lol 2');
  const _runJobs = jobs => new Promise((accept, reject) => {
    const maxTasksInFlight = 100;
    let tasksInFlight = 0;
    const _recurse = async () => {
      if (tasksInFlight < maxTasksInFlight && jobs.length > 0) {
        tasksInFlight++;
        try {
          await jobs.shift()();
        } catch(err) {
          console.warn(err);
        } finally {
          tasksInFlight--;
        }
        _recurse();
      } else if (tasksInFlight === 0) {
        accept();
      }
    };
    for (let i = 0; i < jobs.length; i++) {
      _recurse();
    }
  });
  
  const items = [];
  await _runJobs(keys.map(k => async () => {
    // console.time('inner 1: ' + k);
    const item = await new Promise((accept, reject) => {
      redisClient.hgetall(k, (err, result) => {
        if (!err) {
          for (const k in result){
            try {
              result[k] = JSON.parse(result[k]);
            } catch(err) {
              console.warn('failed to parse key', result, k, err);
            }
          }
          accept(result);
        } else {
          reject(err);
        }
      });
    });
    // console.timeEnd('inner 1: ' + k);
    items.push(item);
  }));
  // console.timeEnd('lol 2');
  return items;

  /* const params = {
    TableName,
  };

  try {
    const o = await ddbd.scan(params).promise();
    const items = (o && o.Items) || [];
    return items;
  } catch (e) {
    console.error(e);
    return null;
  } */
}

const parseRedisItems = result => {
  const [numItems] = result;
  const items = Array(numItems);
  for (let i = 0; i < numItems; i++) {
    // const k = result[1 + i * 2];
    const args = result[1 + i * 2 + 1];
    const o = {};
    for (let j = 0; j < args.length; j += 2) {
      const k = args[j];
      const s = args[j + 1];
      const v = JSON.parse(s);
      o[k] = v;
    }
    items[i] = o;
  }
  return items;
};

module.exports = {
  connect,
  getRedisClient,
  getRedisItem,
  putRedisItem,
  getRedisAllItems,
  parseRedisItems,
};
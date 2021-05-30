const jsonParse = (s, d = null) => {
  try {
    return JSON.parse(s);
  } catch (err) {
    return d;
  }
};

function getExt(fileName) {
  const match = fileName.match(/\.([^\.]+)$/);
  return match && match[1].toLowerCase();
}
const makePromise = () => {
  let accept, reject;
  const p = new Promise((a, r) => {
    accept = a;
    reject = r;
  });
  p.accept = accept;
  p.reject = reject;
  return p;
};

const readStorageHashAsBuffer = async hash => {
  const req = await fetch(`${storageHost}/${hash}`);
  if (!req.ok) return null;

  const arrayBuffer = await req.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
};

module.exports = {
  jsonParse,
  getExt,
  makePromise,
  readStorageHashAsBuffer
}

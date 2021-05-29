const jsonParse = (s, d = null) => {
  try {
    return JSON.parse(s);
  } catch (err) {
    return d;
  }
};
const _setCorsHeaders = res => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    return res;
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
module.exports = {
  jsonParse,
  _setCorsHeaders,
  getExt,
  makePromise,
}

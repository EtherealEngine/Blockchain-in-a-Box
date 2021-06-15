const jsonParse = (s, d = null) => {
  try {
    return JSON.parse(s);
  } catch (err) {
    return d;
  }
};

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

const setCorsHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Expose-Headers', '*');
  return res;
};

module.exports = {
  jsonParse,
  makePromise,
  setCorsHeaders,
};

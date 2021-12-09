export const recursiveParseBigint = obj => {
  if (!obj) return obj;
  return Object.entries(obj).reduce(
    (acum, [key, val]) => {
      if (val instanceof Object) {
        const res = Array.isArray(val)
          ? val.map(el => recursiveParseBigint(el))
          : recursiveParseBigint(val);
        return { ...acum, [key]: res };
      }
      if (typeof val === 'bigint') {
        return { ...acum, [key]: val.toString() };
      }
      return { ...acum, [key]: val };
    },
    { ...obj }
  );
};

export const timeout = async (delay: number) => {
  return new Promise((res) => setTimeout(res, delay));
};

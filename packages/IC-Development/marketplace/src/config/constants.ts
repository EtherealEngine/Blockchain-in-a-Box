
export const Paths = {
  All: '*',
  Home: '/',
  NFT: '/nfts/:nftId',
};

export const Routes = {
  Home: '/',
  NFT: (id: number) => `/nft/${id}`
};

export const Errors = {
  PlugNotConnected: 'Plug is not connected',
};

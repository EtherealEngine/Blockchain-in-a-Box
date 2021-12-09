import { NFT } from '@/models';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectNftState, setNfts, setSelectedNft } from './nft-slice';

export const useNftStore = () => {
  const dispatch = useAppDispatch();
  const { nfts, selectedNft } = useAppSelector(selectNftState);

  const setSelectedCrown = (nft: NFT) => {
    dispatch(setSelectedNft(nft));
  };

  const setNFTs = (nfts: NFT[]) => {
    dispatch(setNfts(nfts));
  };

  return {
    nfts,
    selectedNft,
    setSelectedCrown,
    setNFTs,
  };
};

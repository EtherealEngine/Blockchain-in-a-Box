import { useSnackbar } from '@/components';
import { NFT } from '@/models';
import { FeatureState, useNftControllerStore, useNftStore } from '@/store';
import { useEffect } from 'react';
import { useNFTActor } from '.';

export const useNft = (): NFT | undefined => {
  const snackbar = useSnackbar();
  const { ownedIds, selectedIndex, setNftState, state } =
    useNftControllerStore();
  const { nfts, selectedNft, setNFTs, setSelectedCrown } = useNftStore();

  const nftActor = useNFTActor();

  useEffect(() => {
    if (!ownedIds) return;
    if (selectedNft) {
      const newNfts = nfts ? [...nfts] : [];
      newNfts[selectedIndex] = selectedNft;
      setNFTs(newNfts);
    }
  }, [selectedNft]);

  useEffect(() => {
    if (
      !ownedIds ||
      ownedIds.length === 0 ||
      selectedIndex === undefined ||
      !nftActor ||
      state === FeatureState.Loading
    )
      return;

    if (nfts && nfts[selectedIndex]) {
      // Use already fetched nft
      setSelectedCrown(nfts[selectedIndex]);
    } else {
      // Fetch new nft
      setSelectedCrown(undefined);
      const fetchNft = async () => {
        try {
          setNftState(FeatureState.Loading);

          const response = await nftActor.getMetadataDip721(
            BigInt(ownedIds[selectedIndex])
          );

          if (response['Err']) {
            console.error(response['Err']);
          }
          if (response['Ok']) {
            const nft = response['Ok'][0];
            setSelectedCrown(nft);
          }
        } catch (error) {
          snackbar.push({
            message: `Unable to get NFTs from the canister`,
            gradient: 'fail',
          });
          console.error(error);
        } finally {
          setNftState(FeatureState.Idle);
        }
      };

      fetchNft();
    }
  }, [ownedIds, selectedIndex, nftActor]);

  return selectedNft;
};

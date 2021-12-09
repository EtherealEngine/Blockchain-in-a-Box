import { ENV } from '@/config';
import { NFTIDL } from '@/idls';
import { NFTActor, useActor } from '../actor';

export const useNFTActor = () =>
  useActor<NFTActor>({
    canisterId: ENV.nftCanisterId,
    interfaceFactory: NFTIDL.factory,
  });

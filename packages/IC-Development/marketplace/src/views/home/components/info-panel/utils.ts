import { ENV } from '@/config';
import { RaffleStatus } from '@/models';
import { RaffleTicketStatus } from '@/store';
import { HASHTAGS, TWEET_TEXT } from './constants';

const REVEAL_MESSAGE = 'Reveal 11/29/21, 1PM EST';

export const getPanelContent = (state?: RaffleStatus) => {
  switch (state) {
    case RaffleStatus.RaffleClosed:
      return {
        step: 'Raffle Closed',
        message: 'Winner selection in progress',
      };
    case RaffleStatus.AssigningNFTs:
    case RaffleStatus.Finished:
      return {
        step: 'Reveal Raffle',
        message: 'Marketplace Coming Soon!',
      };
    default:
      return {
        step: 'Enter Raffle',
        message: REVEAL_MESSAGE,
      };
  }
};

export const getCrownTitle = (nftId: number): string => {
  return nftId ? `NFT #${nftId}` : 'NFTs';
};

import { NFTStatus } from '@/store';
import { Principal } from '@dfinity/principal';

export type HistoryLog = {
  principalId: string;
  info: { status: NFTStatus; nftIds: number[] };
};

export type CapHistoryLog = {
  caller: Principal;
  details: [string, any][];
  time: bigint;
  operation: string;
};

// Enum values from canister
export enum RaffleStatus {
  NotStarted = 'NotStarted',
  AssigningNFTs = 'AssigningNFTs',
  AcceptingTickets = 'AcceptingTickets',
  RaffleClosed = 'RaffleClosed',
  Finished = 'Finished',
}

export type Raffle = {
  totalEntries: number;
  status: RaffleStatus;
};

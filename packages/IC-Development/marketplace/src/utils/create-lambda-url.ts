import { ENV } from '@/config';

export enum LambdaEndpoint {
  Create = 'create',
  Verify = 'verify',
  NewTicket = 'new-ticket',
  TicketStatus = 'ticket-status',
  RaffleStatus = 'raffle-status',
  RaffleHistory = 'raffle-history',
}

export const createLambdaUrl = (endpoint: LambdaEndpoint): string => {
  return `${ENV.lambdaURL}/${endpoint}`;
};

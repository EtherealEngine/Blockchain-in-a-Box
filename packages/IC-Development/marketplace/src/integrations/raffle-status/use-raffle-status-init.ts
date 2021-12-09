import { useSnackbar } from '@/components';
import { Http, useHttp } from '@/integrations/http';
import { Raffle } from '@/models';
import {
  NFTStatus,
  RaffleTicketStatus,
  setRaffleStatus,
  setRaffleTicketStatus,
  setRaffleTotalEntries,
  useAppDispatch,
  useDiscordStore,
  usePlugStore,
} from '@/store';
import { createLambdaUrl, LambdaEndpoint } from '@/utils';
import { useEffect } from 'react';

export const useRaffleStatusInit = () => {
  const { user, setUser } = useDiscordStore();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { isConnected, principalId } = usePlugStore();

  const {
    request: raffleRequest,
    response: raffleResponse,
    error: raffleError,
    isLoading: isRaffleLoading,
  } = useHttp<void, Raffle>({
    url: createLambdaUrl(LambdaEndpoint.RaffleStatus),
    method: 'get',
  });

  const {
    request: ticketRequest,
    response: ticketResponse,
    error: ticketError,
    isLoading: isTicketLoading,
  } = useHttp<void, any>({
    url: createLambdaUrl(LambdaEndpoint.TicketStatus),
    method: 'get',
  });

  useEffect(() => {
    raffleRequest();
  }, []);

  useEffect(() => {
    if (raffleResponse && user && isConnected && principalId) {
      ticketRequest({ params: { principalId, discordId: user.id } });
    }
  }, [raffleResponse, user, isConnected, principalId]);

  useEffect(() => {
    // On raffle status response
    if (!raffleResponse) return;
    dispatch(setRaffleTotalEntries(raffleResponse.data.totalEntries ?? 0));
    dispatch(setRaffleStatus(raffleResponse.data.status));
  }, [raffleResponse]);

  useEffect(() => {
    // On raffle status error
    if (!raffleError) return;
    dispatch(setRaffleTotalEntries(undefined));
    dispatch(setRaffleStatus(undefined));
    snackbar.push({
      message: 'Failed to load raffle status',
      gradient: 'fail',
    });
  }, [raffleError]);

  useEffect(() => {
    // On ticket status response
    if (!ticketResponse) return;
    const { status } = ticketResponse?.data || {};
    switch (status) {
      case NFTStatus.None:
      case NFTStatus.Pending:
        dispatch(setRaffleTicketStatus(RaffleTicketStatus.Entered));
        break;
      default:
        return;
    }
  }, [ticketResponse]);

  useEffect(() => {
    // On ticket status error
    if (!ticketError) return;
    const statusCode = ticketError['status'];
    if (statusCode && statusCode === Http.StatusCode.NotFound) {
      dispatch(setRaffleTicketStatus(RaffleTicketStatus.NotEntered));
    } else if (statusCode === Http.StatusCode.Forbidden) {
      snackbar.push({
        message: 'Your Discord account is already registered in the raffle.',
        gradient: 'fail',
      });
      setUser(null);
    } else {
      snackbar.push({
        message: 'Failed to load user status',
        gradient: 'fail',
      });
    }
  }, [ticketError]);

  return {
    isLoading: isRaffleLoading || isTicketLoading,
  };
};

import { Chip, ChipProps } from '@mui/material';
import { forwardRef, useMemo } from 'react';

import { disconnect } from '@/integrations/plug';
import {
  FeatureState,
  RaffleTicketStatus,
  setDiscordState,
  setRaffleTicketStatus,
  useAppDispatch,
  useDiscordStore,
  usePlugStore,
} from '@/store';

import { cutPrincipalId } from './utils';
import { PlugLogo, Spinner } from '..';
import { LocalStorageKey, removeFromStorage } from '@/config';

type PlugPrincipalIDChipProps = Omit<ChipProps, 'label' | 'onDelete'>;

export const PlugPrincipalIDChip = forwardRef<
  HTMLDivElement,
  PlugPrincipalIDChipProps
>(({ children, ...props }, ref) => {
  const { principalId, state, setIsConnected, setPrincipalId } = usePlugStore();
  const { setUser } = useDiscordStore();
  const dispatch = useAppDispatch();

  const handleDisconnect = () => {
    removeFromStorage(LocalStorageKey.DiscordAccessToken);
    removeFromStorage(LocalStorageKey.DiscordExpiresIn);
    dispatch(setRaffleTicketStatus(RaffleTicketStatus.NotEntered));
    setUser(undefined);
    setIsConnected(false);
    setPrincipalId(undefined);
  };

  const shortenedPrincipalId = useMemo(() => {
    const result = principalId
      ? cutPrincipalId(principalId)
      : 'Check your plug version';

    return result;
  }, [principalId]);

  const _onDelete = async () => {
    handleDisconnect();

    await disconnect();
  };

  return (
    <Chip
      ref={ref}
      icon={
        state === FeatureState.Loading ? (
          <Spinner />
        ) : (
          <PlugLogo style={{ marginLeft: 12, marginRight: 0 }} />
        )
      }
      size="large"
      variant="outlined"
      onDelete={_onDelete}
      {...props}
      label={shortenedPrincipalId}
    />
  );
});

PlugPrincipalIDChip.displayName = 'PlugPrincipalIDChip';

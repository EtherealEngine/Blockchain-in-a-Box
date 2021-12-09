import { Box, Stack, Typography } from '@mui/material';

import { LabeledContainer, PlugLogo } from '@/components';
import {
  RaffleTicketStatus,
  selectRaffleState,
  useAppSelector,
  usePlugStore,
} from '@/store';
import { RaffleStatus } from '@/models';
import { useMemo } from 'react';
import { cutPrincipalId } from '@/components/plug-principal-id-chip/utils';

import { NFTAttributes } from './components/nft-attributes';

export const TabDetails = () => {
  const { ticketStatus, raffleStatus } = useAppSelector(selectRaffleState);
  const { principalId } = usePlugStore();

  const shortenedPrincipalId = useMemo(
    () => principalId && cutPrincipalId(principalId),
    [principalId]
  );

  return (
    <>
      <Typography>
        A collection of 10,000 randomly generated 3D NFTs on the Internet Computer.
      </Typography>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', mt: 4 }}>
          <LabeledContainer label="Creator" icon="/assets/cap-logo.png">
            <Typography component="h3" variant="h6">
              CAP
            </Typography>
          </LabeledContainer>
          <LabeledContainer label="Collection" icon="/assets/logo.png">
            <Typography component="h3" variant="h6">
              NFTs
            </Typography>
          </LabeledContainer>
        </Box>
        {ticketStatus === RaffleTicketStatus.Won &&
          raffleStatus === RaffleStatus.Finished && (
            <>
              <NFTAttributes />
            </>
          )}
      </Stack>
    </>
  );
};

import {
  GradientButton,
  GradientText,
  PlugButton,
  Spinner,
} from '@/components';

import { PLUG_WHITELIST } from '@/integrations/plug';
import { RaffleStatus } from '@/models';
import {
  RaffleTicketStatus,
  selectRaffleState,
  useAppSelector,
  useDiscordStore,
  usePlugStore,
} from '@/store';
import { Alert } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import React, { useMemo } from 'react';
import { FaCheck } from '@react-icons/all-files/fa/FaCheck';
import { FaTimes } from '@react-icons/all-files/fa/FaTimes';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';
import { InfoPanelDetails, InfoPanelPager, InfoPanelTabs } from './components';
import { InfoPanelStyles as Styled } from './styles';
import { getCrownTitle, getPanelContent } from './utils';
import { useNftController } from '@/integrations/nft/use-nft-controller';
import { DISCORD_AUTH_URL } from '@/integrations/discord';
import { FaDiscord } from '@react-icons/all-files/fa/FaDiscord';

export type InfoPanelProps = {
  src?: string;
  isLoading?: boolean;
  onEnterRaffle: () => void;
};

export const InfoPanel: React.FC<InfoPanelProps> = ({
  isLoading,
  onEnterRaffle,
}) => {
  const { ticketStatus, totalEntries, raffleStatus } =
    useAppSelector(selectRaffleState);
  const {
    totalNfts: totalNFTs,
    selectedId,
    isLoading: isNFTLoading,
  } = useNftController();

  const { isConnected, principalId } = usePlugStore();
  const { user } = useDiscordStore();

  const isDiscordUser = Boolean(user);

  const { step, message } = useMemo(
    () => getPanelContent(raffleStatus),
    [raffleStatus]
  );
  const title = useMemo(() => getCrownTitle(selectedId), [selectedId]);

  return (
    <Styled.Panel>
      <Styled.AlertContainer>
        <Alert severity="info">
          This is an alpha network. If you're experiencing issues entering the
          raffle - try again after some time.
        </Alert>
      </Styled.AlertContainer>
      {totalNFTs > 0 && <InfoPanelPager />}
      <Styled.Container isMultipleNFTs={totalNFTs > 1}>
        <Styled.TopTextBox>
          <GradientText>{step}</GradientText>
          <Typography>{message}</Typography>
        </Styled.TopTextBox>
        <Styled.HeadingBox>
          <Typography component="h1" variant="h4" fontWeight="bold">
            {title}
          </Typography>
        </Styled.HeadingBox>
        <InfoPanelTabs />

        {ticketStatus !== RaffleTicketStatus.Won && (
          <InfoPanelDetails entries={totalEntries} supply={5000} />
        )}

        {!isConnected && (
          <PlugButton size="large" fullWidth whitelist={PLUG_WHITELIST} />
        )}

        {isConnected &&
          (isLoading || isNFTLoading ? (
            <GradientButton
              size="large"
              fullWidth
              disabled
              onClick={onEnterRaffle}
            >
              <Spinner />
            </GradientButton>
          ) : raffleStatus === RaffleStatus.NotStarted ? (
            <GradientButton size="large" disabled fullWidth>
              Raffle will start soon
            </GradientButton>
          ) : ticketStatus === RaffleTicketStatus.NotEntered &&
            raffleStatus === RaffleStatus.AcceptingTickets &&
            user ? (
            <GradientButton size="large" fullWidth onClick={onEnterRaffle}>
              Solve the Captcha
            </GradientButton>
          ) : !user && raffleStatus !== RaffleStatus.Finished ? (
            <Styled.DiscordButton
              fullWidth
              href={DISCORD_AUTH_URL}
              size="large"
              endIcon={<FaDiscord size={40} />}
              color="discord"
              variant="contained"
            >
              {user === null ? 'Use another Discord' : 'Connect to Discord'}
            </Styled.DiscordButton>
          ) : ticketStatus === RaffleTicketStatus.Entered &&
            raffleStatus === RaffleStatus.AcceptingTickets ? (
            <GradientButton size="large" fullWidth gradient="success" disabled>
              <FaCheck />
              &nbsp;You are in the Raffle
            </GradientButton>
          ) : raffleStatus === RaffleStatus.RaffleClosed ? (
            <GradientButton size="large" fullWidth disabled>
              Raffle closed, wait for results!
            </GradientButton>
          ) : raffleStatus === RaffleStatus.AssigningNFTs ? (
            <GradientButton size="large" fullWidth gradient="success" disabled>
              <Spinner style={{ width: 25, height: 25 }} />
              &nbsp;&nbsp;&nbsp;Assigning NFTs
            </GradientButton>
          ) : ticketStatus === RaffleTicketStatus.Lost &&
            raffleStatus === RaffleStatus.Finished ? (
            <GradientButton size="large" fullWidth gradient="fail">
              <FaTimes />
              &nbsp;You did not win the raffle
            </GradientButton>
          ) : (
            ticketStatus === RaffleTicketStatus.NotEntered &&
            raffleStatus === RaffleStatus.Finished && (
              <GradientButton
                size="large"
                fullWidth
                onClick={onEnterRaffle}
                gradient="fail"
                disabled={isDiscordUser}
              >
                <FaTimes />
                &nbsp;The raffle ended already!
              </GradientButton>
            )
          ))}
      </Styled.Container>
    </Styled.Panel>
  );
};

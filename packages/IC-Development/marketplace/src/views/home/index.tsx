import React, { useState } from 'react';

import { HomeStyles as Styled } from './styles';
import {
  EnterRaffleModal,
  ResultModal,
  NFTView,
  InfoPanel,
} from './components';
import { usePlugInit } from '@/integrations/plug';
import { useDiscordInit } from '@/integrations/discord';
import { useRaffleStatusInit } from '@/integrations/raffle-status';
import { useNftEffects } from '@/integrations/nft';

export const Home: React.FC = () => {
  const [enterRaffleModal, setEnterRaffleModal] = useState(false);
  const [resultModal, setResultModal] = useState(false);

  useDiscordInit();
  usePlugInit();
  useNftEffects();
  const { isLoading } = useRaffleStatusInit();

  return (
    <Styled.Container>
      <NFTView />

      <InfoPanel
        isLoading={isLoading}
        onEnterRaffle={() => setEnterRaffleModal(true)}
      />

      <EnterRaffleModal open={enterRaffleModal} setOpen={setEnterRaffleModal} />
      <ResultModal open={resultModal} setOpen={setResultModal} />
    </Styled.Container>
  );
};

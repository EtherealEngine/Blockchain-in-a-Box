import { ButtonProps } from '@mui/material';
import { forwardRef } from 'react';
import type { Provider } from '../../lib/plug-inpage-provider';

import { FeatureState, usePlugStore } from '@/store';

import { PlugLogo } from '../plug-logo';
import { PLUG_WALLET_WEBSITE_URL } from './constants';
import { PlugButtonStyles as Styled } from './styles';

export type PlugButtonProps = Omit<ButtonProps, 'color' | 'variant'> & {
  whitelist: string[];
  host?: string;
};

export const PlugButton = forwardRef<HTMLButtonElement, PlugButtonProps>(
  ({ whitelist, host, ...props }, ref) => {
    const { setIsConnected, setPlugState, state } = usePlugStore();

    const isPlugPAPIExists = Boolean(window.ic?.plug);

    const handleConnectAttempt = async (): Promise<void> => {
      if (!isPlugPAPIExists) {
        window.open(PLUG_WALLET_WEBSITE_URL, '_blank');
        return;
      }

      try {
        setPlugState(FeatureState.Loading);
        const isConnected = await window.ic?.plug?.requestConnect({
          whitelist,
          host,
        });

        if (isConnected) {
          setIsConnected(isConnected);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPlugState(FeatureState.Idle);
      }
    };

    const isLoading = state === FeatureState.Loading;

    return (
      <Styled.Container
        ref={ref}
        {...props}
        startIcon={<PlugLogo />}
        onClick={isLoading ? () => null : handleConnectAttempt}
      >
        {isLoading
          ? 'Loading...'
          : isPlugPAPIExists
          ? 'Connect to Plug'
          : 'Install Plug'}
      </Styled.Container>
    );
  }
);

PlugButton.displayName = 'PlugButton';

declare global {
  interface Window {
    ic?: {
      plug?: Provider;
    };
  }
}

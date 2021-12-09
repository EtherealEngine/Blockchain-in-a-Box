import { PlugPrincipalIDChip } from '@/components';
import { PLUG_WHITELIST } from '@/integrations/plug';
import { usePlugStore } from '@/store';
import { Routes } from '@/config';

import { PlugButton } from '../plug-button';
import { LayoutStyles as Styled } from './styles';

export const Layout = ({ children }) => {
  const { isConnected } = usePlugStore();

  return (
    <>
      <Styled.Header>
        <Styled.Container>
          <Styled.Nav direction="row" spacing={4}>
            <Styled.LogoLink href={Routes.Home}>
              <img width="48" height="40" src="/assets/logo.png" alt="Logo" />
              <img
                width="67"
                height="21"
                src="/assets/logo-text.svg"
                alt="Logo"
              />
            </Styled.LogoLink>
          </Styled.Nav>

          {isConnected ? (
            <PlugPrincipalIDChip />
          ) : (
            <PlugButton whitelist={PLUG_WHITELIST} />
          )}
        </Styled.Container>
      </Styled.Header>
      {children}
    </>
  );
};

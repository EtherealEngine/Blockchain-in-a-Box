import { Container, Stack, Typography } from '@mui/material';
import { EmptyMobileStyles as Styled } from './styles';

export const EmptyMobile = () => {
  return (
    <Styled.Container>
      <Styled.LogoWrapper>
        <img width="85" height="70" src="/assets/logo.png" alt="Logo" />
        <img width="135" height="49" src="/assets/logo-text.svg" alt="Logo" />
      </Styled.LogoWrapper>

      <Container maxWidth="xs">
        <Typography component="h2" variant="h4" lineHeight="2">
          Desktop only
        </Typography>
        <Typography>
          This app is not supported on mobile devices, please switch to desktop browser.
        </Typography>
      </Container>
    </Styled.Container>
  );
};

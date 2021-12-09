import { Link as MuiLink } from '@mui/material';
import { styled } from '@mui/system';

export namespace EmptyMobileStyles {
  export const Container = styled('main')`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    min-height: 100vh;
    text-align: center;
    padding: ${({ theme }) => theme.spacing(4)};
  `;

  export const LogoWrapper = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `;

  export const Link = styled(MuiLink)`
    color: ${({ theme }) => theme.palette.text.secondary};
  `;
}

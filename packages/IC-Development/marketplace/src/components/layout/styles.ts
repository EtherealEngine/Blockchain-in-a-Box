import Stack from '@mui/material/Stack';
import { styled } from '@mui/system';
import { Link } from '@mui/material';

export namespace LayoutStyles {
  export const Header = styled('header')(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.grey.A100}`,
    padding: theme.spacing(2, 0),
  }));

  export const Nav = styled(Stack)(() => ({
    alignItems: 'center',
  }));

  export const Container = styled('div')(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
  }));

  export const LogoLink = styled(Link)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    width: theme.spacing(16),
    justifyContent: 'space-between',
  }));

  export const LogoText = styled('span')(({ theme }) => ({
    display: 'block',
    marginLeft: theme.spacing(1),
  }));
}

import { Theme } from '@mui/material';
import Button from '@mui/material/Button';
import { styled } from '@mui/system';

export namespace GradientButtonStyles {
  export interface ContainerProps {
    gradient: keyof Theme['gradient'];
  }

  export const Container = styled(Button)<ContainerProps>`
    background: ${({ theme, gradient }) => theme.gradient[gradient]};

    &.Mui-disabled {
      // Same as MUI Button disabled color
      color: white;
      background: ${({ theme, gradient }) => theme.gradient[gradient]};
    }
  `;
}

import { styled } from '@mui/system';

export namespace GradientTextStyles {
  export interface ContainerProps {
    gradient: 'default' | 'success' | 'fail';
  }

  export const Container = styled('span')<ContainerProps>`
    background: ${({ theme, gradient }) => theme.gradient[gradient]};
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    width: fit-content;
    height: fit-content;

    *,
    * > * {
      background: inherit;
      width: inherit;
      height: inherit;
    }
  `;
}

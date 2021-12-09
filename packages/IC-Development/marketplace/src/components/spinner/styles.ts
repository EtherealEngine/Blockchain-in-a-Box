import { styled } from '@mui/system';

export namespace SpinnerStyles {
  export const Container = styled('div')`
    .spinner {
      animation: rotate 2s linear infinite;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;

      & .path {
        stroke: ${({ theme }) => theme.palette.primary.main};
        stroke-linecap: round;
        animation: dash 1.5s ease-in-out infinite;
      }
    }

    @keyframes rotate {
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes dash {
      0% {
        stroke-dasharray: 1, 150;
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -35;
      }
      100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -124;
      }
    }
  `;
}

import { Paper, Theme } from '@mui/material';
import { styled } from '@mui/system';

export namespace SnackbarStyles {
  export type ContainerProps = {
    gradient: keyof Theme['gradient'];
  };

  export const Container = styled(Paper)<ContainerProps>`
    position: relative;
    width: 100%;
    min-width: 500px;
    min-height: 50px;
    height: 100%;
    border-radius: 9999px;
    background: ${({ theme, gradient }) => theme.gradient[gradient]};
    background-color: ${({ theme }) => theme.palette.primary.main};
  `;

  export const Content = styled('div')`
    position: absolute;
    padding: ${({ theme }) => theme.spacing(1, 2)};
    top: 3px;
    left: 3px;
    right: 3px;
    bottom: 3px;
    background-color: ${({ theme }) => theme.palette.background.paper};
    border-radius: inherit;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    & > span {
      flex: 1;
    }
  `;

  export const Counter = styled('div')<ContainerProps>`
    position: absolute;
    left: -${({ theme }) => theme.spacing(1.5)};
    top: calc(50% - ${({ theme }) => theme.spacing(1.5)}px);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: ${({ theme }) => theme.spacing(3)};
    height: ${({ theme }) => theme.spacing(3)};
    border-radius: 50%;
    background: ${({ theme, gradient }) => theme.gradient[gradient]};
    line-height: 0;
    font-size: 12px;
    font-weight: bold;
    color: ${({ theme }) => theme.palette.background.paper};
  `;

  export const IconContainer = styled('div')`
    margin: ${({ theme }) => theme.spacing(0, 2, 0, 0.5)};
    display: flex;
    justify-content: center;
    align-items: center;
  `;
}

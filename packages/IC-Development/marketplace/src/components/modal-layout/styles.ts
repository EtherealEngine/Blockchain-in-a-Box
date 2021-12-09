import { styled } from '@mui/system';

export namespace ModalLayoutStyles {
  export const Container = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    max-width: 500px;
    padding: ${({ theme }) => theme.spacing(4)};
    background-color: ${({ theme }) => theme.palette.background.paper};
    border-radius: 30px;
  `;

  export const Footer = styled('div')`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    align-self: stretch;

    margin: ${({ theme }) => theme.spacing(2)} 0 0 0;

    button {
      flex: 1;
      margin: ${({ theme }) => theme.spacing(0, 1)};
      &:first-child {
        margin-left: 0;
      }
      &:last-child {
        margin-right: 0;
      }
      padding: unset;
      height: 65px;
    }
  `;

  export const Title = styled('h1')`
    margin: 0 0 ${({ theme }) => theme.spacing(1)} 0;
  `;

  export const Text = styled('p')`
    margin: ${({ theme }) => theme.spacing(1)} 0;
  `;

  export type CentralizedProps = {
    direction?: 'column' | 'row';
  };

  export const Centralized = styled('div')<CentralizedProps>`
    margin: ${({ theme }) => theme.spacing(1)} 0;
    align-self: stretch;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: ${({ direction }) => direction || 'column'};
  `;
}

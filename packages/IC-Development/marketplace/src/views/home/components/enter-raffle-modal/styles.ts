import { styled } from '@mui/system';
import Button from '@mui/material/Button';

export namespace EnterRaffleModalStyles {
  export const DiscordButton = styled(Button)`
    justify-content: space-between;

    padding: 12px 30px;

    border-color: ${(props) => props.theme.palette.discord[500]} !important;
    color: ${(props) => props.theme.palette.text.primary} !important;
  `;

  export const TicketsCounter = styled('input')`
    all: unset;
    flex: 1;
    height: 85px;
    background-color: #1b1b1b;
    border: 2px solid #626262;
    border-radius: 20px;
    margin: 0 ${({ theme }) => theme.spacing(2)};
    text-align: center;
    font-size: 36px;
    font-weight: bold;
    min-width: 100px; // Firefox sizing fix

    &:focus {
      border: 2px solid ${({ theme }) => theme.palette.primary.main};
    }

    // Remove arrows from input
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    &[type='number'] {
      -moz-appearance: textfield;
    }
  `;

  export const TicketsChangeButton = styled(Button)`
    width: 85px;
    min-width: 85px;
    height: 85px;
    border-radius: 20px;
    padding: 0;
    font-size: 36px;
  `;
}

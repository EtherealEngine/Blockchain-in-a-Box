import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/system';

export namespace TabHistoryStyles {
  export const Container = styled('div')`
    text-align: center;
  `;

  export const ItemContainer = styled(Button)`
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: stretch;
    width: 100%;
    padding: ${({ theme }) => theme.spacing(1)};
    margin: ${({ theme }) => theme.spacing(1, 0)};
    background: none;
    border: none;

    user-select: none;
    transition: background-color 0.2s ease-in-out;

    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.palette.grey.A100};
    }
  `;

  export const ItemData = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    flex: 1;
    padding: ${({ theme }) => theme.spacing(0, 1)};
  `;

  export const ItemLog = styled(Typography)`
    color: ${({ theme }) => theme.palette.text.secondary};
    font-size: 16px;

    .highlighted {
      color: ${({ theme }) => theme.palette.primary.main};
      font-weight: bold;
    }
  `;

  export const ItemDate = styled(Typography)`
    color: ${({ theme }) => theme.palette.text.secondary};
    font-size: 14px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  `;
}

import Typography from '@mui/material/Typography';
import { styled } from '@mui/system';
export namespace AttributesStyles {
  export const Container = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    margin: ${({ theme }) => theme.spacing(1)} 0;
  `;

  export const Row = styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    &:first-child {
      margin-top: ${({ theme }) => theme.spacing(1)};
    }
    &:last-child {
      margin-bottom: ${({ theme }) => theme.spacing(1)};
    }
  `;

  export const TitleContainer = styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: ${({ theme }) => theme.spacing(2)};
  `;

  export const Cell = styled('div')`
    border: 2px solid ${({ theme }) => theme.palette.grey.A100};
    padding: ${({ theme }) => theme.spacing(1)};
    margin: ${({ theme }) => theme.spacing(1)};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    flex: 1;
    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
  `;
  export const CellLabel = styled('label')`
    font-size: 16px;
    color: #615b6f;
    text-transform: uppercase;
  `;
  export const CellTrait = styled(Typography)`
    text-transform: capitalize;
    padding: ${({ theme }) => theme.spacing(1)};
  `;
  export const CellPercentage = styled('span')`
    font-size: 14px;
    color: #615b6f;
  `;
}

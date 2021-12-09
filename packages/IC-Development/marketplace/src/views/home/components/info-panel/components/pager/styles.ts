import { styled } from '@mui/system';

export namespace InfoPanelPagerStyles {
  export const Container = styled('div')`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 50px;
    border-left: 1px solid ${({ theme }) => theme.palette.grey.A100};
    background-color: #1b1b1b;
  `;

  export const Content = styled('div')`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex: 1;
  `;

  export const PrevContainer = styled('div')`
    width: 20%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  `;

  export const NextContainer = styled('div')`
    width: 20%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0 10px;
  `;
}

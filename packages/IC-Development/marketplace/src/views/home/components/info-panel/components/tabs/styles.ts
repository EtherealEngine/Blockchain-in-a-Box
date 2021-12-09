import { styled } from '@mui/system';
import { Tabs as MuiTabs } from '@mui/material';

export namespace InfoPanelStyles {
  export const Container = styled('div')`
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    min-height: 120px;

    &:after {
      content: '';
      position: absolute;
      pointer-events: none;
      height: 80px;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent 0%, #121212 100%);
    }
  `;

  export const Wrapper = styled('div')`
    margin-top: ${({ theme }) => theme.spacing(2)};
    overflow: auto;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    &::-webkit-scrollbar {
      display: none; /* for Chrome, Safari, and Opera */
    }
  `;

  export const Tabs = styled(MuiTabs)`
    border-bottom: 1px solid ${({ theme }) => theme.palette.grey.A100};
  `;
}

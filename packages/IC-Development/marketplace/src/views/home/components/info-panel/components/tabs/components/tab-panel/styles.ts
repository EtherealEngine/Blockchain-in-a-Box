import { styled } from '@mui/system';
import { Box as MuiBox } from '@mui/material';

export namespace TabPanelStyles {
  export const Box = styled(MuiBox)`
    padding: ${({ theme }) => theme.spacing(3)} 0;
    overflow-y: auto;
  `;
}

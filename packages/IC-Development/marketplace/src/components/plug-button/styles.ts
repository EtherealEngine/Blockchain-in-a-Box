import Button from '@mui/material/Button';
import { styled } from '@mui/system';

export namespace PlugButtonStyles {
  export const Container = styled(Button)`
    position: relative;
    background-clip: padding-box;
    background: ${({ theme }) => theme.palette.background.default} !important;
    border: 3px solid transparent !important;
    padding-left: ${({ theme }) => theme.spacing(2)};
    padding-right: ${({ theme }) => theme.spacing(2)};
    max-height: '66px';

    &:before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: -1;
      margin: -5px;
      border-radius: inherit;
      background: linear-gradient(
        93.07deg,
        #ffd719 0.61%,
        #f754d4 33.98%,
        #1fd1ec 65.84%,
        #48fa6b 97.7%
      );
    }
  `;
}

import { styled } from '@mui/system';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
export namespace InfoPanelStyles {
  export const HeadingBox = styled('div')`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  export const ShareButton = styled(IconButton)`
    border: 1px solid ${({ theme }) => theme.palette.primary.main};
  `;

  export const Panel = styled('aside')`
    max-width: ${({ theme }) => theme.spacing(66)};
    min-width: ${({ theme }) => theme.spacing(66)};
    border-left: 1px solid ${({ theme }) => theme.palette.grey.A100};
  `;

  interface ContainerProps {
    isMultipleNFTs?: boolean;
  }

  export const Container = styled('div') <ContainerProps>`
    padding: ${({ theme }) => theme.spacing(5)};
    height: calc(
      100vh - 80px - 68px
        ${({ isMultipleNFTs }) => isMultipleNFTs && '- 50px'}
    );
    display: flex;
    flex-direction: column;
  `;

  export const TopTextBox = styled('div')`
    display: flex;
    justify-content: space-between;
    padding-bottom: ${({ theme }) => theme.spacing(2)};
  `;

  export const AlertContainer = styled('div')`
    border-bottom: 1px solid ${({ theme }) => theme.palette.grey.A100};
  `;

  export const DiscordButton = styled(Button)`
    padding: 12px 30px;

    border-color: ${(props) => props.theme.palette.discord[500]} !important;
    color: ${(props) => props.theme.palette.text.primary} !important;
  `;
}

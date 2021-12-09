import { styled } from '@mui/system';

export namespace NFTViewStyles {
  export const Video = styled('video')`
    width: 100%;
    height: auto;
    border-radius: 40px;
    max-width: 100%;
    max-height: 100%;
  `;

  export const ImageContainer = styled('div')`
    width: 100%;
    height: calc(100vh - 80px);
    margin: 0 auto;
    padding: 64px 0;
    display: flex;
    flex-direction: column;
  `;

  export const ImageContainer2 = styled('div')`
    width: 100%;
    height: 100%;
    max-width: 1020px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    flex: 1 0 auto;
  `;

  export const ImagePadding = styled('div')`
    max-height: 100%;
    flex: 1 0 auto;
    padding: 0 10%;
    display: flex;
    flex-direction: column;
  `;

  export const ImageWrapper = styled('div')`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 40px;
  `;

  type ImageProps = {
    isLoading?: boolean;
  };

  export const Image = styled('img')<ImageProps>`
    opacity: ${({ isLoading }) => (isLoading ? '0.5' : '1')};
    height: auto;
    border-radius: 40px;
    max-width: 100%;
    max-height: 100%;
    ${({ theme }) => theme.breakpoints.down('lg')} {
      width: 100%;
      object-fit: cover;
    }
  `;
}

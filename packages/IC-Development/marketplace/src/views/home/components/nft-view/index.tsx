import { useNftController } from '@/integrations/nft/use-nft-controller';
import { useNft } from '@/integrations/nft';
import { useMemo } from 'react';
import { CrownImage } from './nft-image';
import { NFTViewStyles as Styled } from './styles';

export const NFTView = () => {
  const selectedCrown = useNft();
  const { isLoading } = useNftController();

  const videoSrc = useMemo(() => {
    if (!selectedCrown) return undefined;

    return selectedCrown.key_val_data.find((kv) => kv.key === 'location')?.val
      .TextContent;
  }, [selectedCrown?.key_val_data]);

  return (
    <Styled.ImageContainer>
      <Styled.ImageContainer2>
        <Styled.ImagePadding>
          <Styled.ImageWrapper>
            {videoSrc ? (
              <Styled.Video
                loop
                autoPlay
                muted
                preload="metadata"
                controls={false}
                poster="/assets/random-nft.png"
              >
                <source src={videoSrc} type="video/mp4" />
                No video to show
              </Styled.Video>
            ) : (
              <CrownImage isLoading={isLoading} />
            )}
          </Styled.ImageWrapper>
        </Styled.ImagePadding>
      </Styled.ImageContainer2>
    </Styled.ImageContainer>
  );
};

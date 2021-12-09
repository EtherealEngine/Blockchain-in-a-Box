import { Spinner } from '@/components';
import { PreloadImage } from '@/components/preload-image';
import React, { useState } from 'react';
import { NFTViewStyles as Styled } from './styles';

export interface CrownImageProps {
  isLoading: boolean;
}

export const CrownImage: React.FC<CrownImageProps> = ({ isLoading }) => {
  const [hasImage, setHasImage] = useState(false);

  if (!hasImage) {
    return (
      <>
        <PreloadImage
          onLoad={() => setHasImage(true)}
          src="/assets/random-nft.png"
        />
        <Spinner />
      </>
    );
  }

  return (
    <>
      <Styled.Image
        isLoading={isLoading}
        src="/assets/random-nft.png"
        alt="NFT"
        role="link"
      />
      {isLoading && <Spinner style={{ position: 'absolute' }} />}
    </>
  );
};

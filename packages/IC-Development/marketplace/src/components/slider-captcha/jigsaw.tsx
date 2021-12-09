import React from 'react';
import { calculatePositionPercentage } from './core';
import { JigsawProps } from './models';
import { CaptchaSliderStyles as Styled } from './styles';

export const Jigsaw: React.FC<JigsawProps> = ({
  challenge,
  position,
  imageUrl,
}) => {
  return (
    <Styled.JigsawContainer imageUrl={imageUrl}>
      <Styled.JigsawSlot challenge={calculatePositionPercentage(challenge)} />
      <Styled.JigsawPiece
        imageUrl={imageUrl}
        position={calculatePositionPercentage(position)}
        challenge={calculatePositionPercentage(challenge)}
      />
    </Styled.JigsawContainer>
  );
};

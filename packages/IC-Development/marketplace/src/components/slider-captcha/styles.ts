import { styled } from '@mui/system';
import { CaptchaState } from './models';
import {
  CONTAINER_HEIGHT,
  CONTAINER_WIDTH,
  JIGSAW_PIECE_SIZE,
} from './constants';
import { getCaptchaStateGradient } from './core';
import { GradientButton } from '../gradient-button';
import { Spinner } from '../spinner';
import { notForwardProps } from '@/utils';

export namespace CaptchaSliderStyles {
  const calculateRightPosition = (position: number, width: number): string => {
    return `calc(${position}% - ${(position / 100) * width}px)`;
  };

  export type WithPosition = {
    position: number;
  };

  export type WithChallenge = {
    challenge: number;
  };

  export type WithCaptchaState = {
    captchaState: CaptchaState;
  };

  export type WithImageUrl = {
    imageUrl: string;
  };

  export const Container = styled('div')`
    position: relative;
    width: ${CONTAINER_WIDTH}px;
    height: ${CONTAINER_HEIGHT}px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: ${({ theme }) => theme.spacing(1)};
    user-select: none;
    overflow: hidden;

    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    border: 1px solid ${({ theme }) => theme.palette.divider};
  `;

  export const SliderContainer = styled('div')`
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: ${({ theme }) => theme.spacing(1)};
  `;

  export const SliderTrail = styled('div', {
    shouldForwardProp: notForwardProps(['position', 'captchaState']),
  })<WithPosition & WithCaptchaState>`
    position: relative;
    width: 100%;
    height: 30px;
    border-radius: 15px;
    overflow: hidden;
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    border: 1px solid ${({ theme }) => theme.palette.divider};

    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.8rem;
    font-weight: bolder;

    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: ${({ position }) => position}%;
      border-radius: inherit;
      background: ${({ theme, captchaState }) =>
        theme.gradient[getCaptchaStateGradient(captchaState)]};
    }
  `;

  export const SliderThumb = styled('div', {
    shouldForwardProp: notForwardProps(['position']),
  })<WithPosition>`
    width: 30px;
    height: 30px;
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    background: ${({ theme }) => theme.palette.primary.main};
    position: absolute;
    top: calc(50% - 15px);
    right: ${({ position }) => calculateRightPosition(position, 30)};
    cursor: grab;

    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 0;

    &:active {
      cursor: grabbing;
    }
  `;

  export const SliderThumbSpinner = styled(Spinner)`
    width: 20px;
    height: 20px;

    .spinner > .path {
      stroke: ${({ theme }) => theme.palette.background.default};
    }
  `;

  export const JigsawContainer = styled('div', {
    shouldForwardProp: notForwardProps(['imageUrl']),
  })<WithImageUrl>`
    position: relative;
    width: 100%;
    flex: 1;
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    border: 1px solid ${({ theme }) => theme.palette.divider};
    background-image: url(${({ imageUrl }) => imageUrl});
    background-size: ${CONTAINER_WIDTH}px auto;
    background-position: 100% center;
    background-repeat: no-repeat;
  `;

  export const JigsawSlot = styled('div', {
    shouldForwardProp: notForwardProps(['challenge']),
  })<WithChallenge>`
    position: absolute;
    width: ${JIGSAW_PIECE_SIZE}px;
    height: ${JIGSAW_PIECE_SIZE}px;
    top: calc(50% - ${JIGSAW_PIECE_SIZE / 2}px);
    right: ${({ challenge }) =>
      calculateRightPosition(challenge, JIGSAW_PIECE_SIZE)};
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    border: 1px solid ${({ theme }) => theme.palette.divider};

    box-shadow: inset 0 0 10px #000000;
  `;

  export const JigsawPiece = styled('div', {
    shouldForwardProp: notForwardProps(['position', 'challenge', 'imageUrl']),
  })<WithPosition & WithChallenge & WithImageUrl>`
    position: absolute;
    width: ${JIGSAW_PIECE_SIZE}px;
    height: ${JIGSAW_PIECE_SIZE}px;
    top: calc(50% - ${JIGSAW_PIECE_SIZE / 2}px);
    right: ${({ position }) =>
      calculateRightPosition(position, JIGSAW_PIECE_SIZE)};
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    border: 1px solid ${({ theme }) => theme.palette.divider};
    background-color: ${({ theme }) => theme.palette.primary.main};

    background-image: url(${({ imageUrl }) => imageUrl});
    background-size: ${CONTAINER_WIDTH}px auto;
    background-position: ${({ challenge }) =>
      `calc(${100 - challenge}% - ${
        (0.5 * (JIGSAW_PIECE_SIZE * challenge)) / 100 - 0.5
      }px) center`};
    background-repeat: no-repeat;
  `;

  export const RetryButton = styled(GradientButton)`
    position: absolute;
    box-shadow: ${({ theme }) => theme.shadows[2]};
    padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(3)}`};
  `;

  export const RetryOverlay = styled('div')`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: ${({ theme }) => theme.palette.background.paper}77;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  export const ContainerSpinner = styled(Spinner)`
    width: 50px;
    height: 50px;
  `;
}

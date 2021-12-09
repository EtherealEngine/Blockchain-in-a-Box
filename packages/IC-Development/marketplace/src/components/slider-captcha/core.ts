import { CaptchaState } from './models';
import {
  CHALLENGE_RESULT_VARIATION,
  CHALLENGE_TRAIL_VARIATION,
  TRAIL_END,
  TRAIL_START,
  TRAIL_SIZE,
} from './constants';

export const calculateSliderPosition = (
  clientX: number,
  left: number,
  right: number
): number => {
  return (
    Math.min(Math.max((clientX - left) / (right - left), 0), 1) * TRAIL_SIZE +
    TRAIL_START
  );
};

export const calculatePositionPercentage = (value: number): number => {
  return ((TRAIL_END - value) / TRAIL_SIZE) * 100;
};

export const createChallenge = (): number => {
  const variation = TRAIL_SIZE * CHALLENGE_TRAIL_VARIATION;
  return Math.random() * (TRAIL_SIZE - variation) + variation + TRAIL_START;
};

export const verifyChallenge = (result: number, challenge: number): boolean => {
  return Math.abs(result - challenge) < TRAIL_SIZE * CHALLENGE_RESULT_VARIATION;
};

export const getCaptchaStateGradient = (state: CaptchaState): string => {
  switch (state) {
    case CaptchaState.INITIAL:
      return 'default';
    case CaptchaState.COMPLETED:
      return 'success';
    case CaptchaState.FAILED:
      return 'fail';
    default:
      throw new Error('Unknown captcha state');
  }
};

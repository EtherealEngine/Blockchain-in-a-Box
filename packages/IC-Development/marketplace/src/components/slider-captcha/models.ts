// SliderCaptcha
export enum CaptchaState {
  INITIAL,
  COMPLETED,
  FAILED,
}

export type SliderCaptchaProps = {
  onComplete: (verifiedToken: string) => void;
  prevStep: () => void;
};

// Jigsaw
export type JigsawProps = {
  challenge: number;
  position: number;
  imageUrl: string;
};

// Slider
export type MovementRecorder = {
  x: number[];
  y: number[];
};

export type MovementCompleteEvent = {
  movementTrack: MovementRecorder;
  solution: number;
};

export type SliderProps = {
  position: number;
  setPosition: React.Dispatch<React.SetStateAction<number>>;
  onMovementComplete: (event: MovementCompleteEvent) => void;
  captchaState: CaptchaState;
  isLoading: boolean;
};

// HTTP Requests
export type CreateCaptchaResponse = {
  imageUrl: string;
  token: string;
};

export type VerifyCaptchaRequest = MovementCompleteEvent;

export type VerifyCaptchaResponse = {
  token: string;
};

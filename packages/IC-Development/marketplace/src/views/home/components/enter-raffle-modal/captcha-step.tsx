import {
  GradientButton,
  SliderCaptcha,
  ModalLayoutStyles as StyledModal,
} from '@/components';
import React, { useState } from 'react';
import Button from '@mui/material/Button';

export type CaptchaStepProps = {
  nextStep: (verifiedToken: string) => void;
  prevStep: () => void;
};

export const CaptchaStep: React.FC<CaptchaStepProps> = ({
  nextStep,
  prevStep,
}) => {
  const [verifiedToken, setVerifiedToken] = useState<string>();

  return (
    <>
      <StyledModal.Title>Verify</StyledModal.Title>
      <StyledModal.Text>Please solve the captcha below.</StyledModal.Text>
      <StyledModal.Centralized>
        <SliderCaptcha
          prevStep={prevStep}
          onComplete={(token) => setVerifiedToken(token)}
        />
      </StyledModal.Centralized>
      <StyledModal.Footer>
        <Button variant="outlined" onClick={prevStep} size="large">
          Back
        </Button>
        <GradientButton
          onClick={() => nextStep(verifiedToken)}
          disabled={!verifiedToken}
          size="large"
        >
          Next
        </GradientButton>
      </StyledModal.Footer>
    </>
  );
};

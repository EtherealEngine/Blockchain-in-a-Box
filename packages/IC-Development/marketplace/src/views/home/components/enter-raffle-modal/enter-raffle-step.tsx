import React, { useEffect } from 'react';
import Button from '@mui/material/Button';
import {
  GradientButton,
  Spinner,
  ModalLayoutStyles as StyledModal,
  useSnackbar,
} from '@/components';
import { useHttp } from '@/integrations/http';
import { createBearerToken, createLambdaUrl, LambdaEndpoint } from '@/utils';
import { usePlugStore } from '@/store';

export type EnterRaffleStepProps = {
  nextStep: () => void;
  prevStep: () => void;
  verifiedToken: string;
};

export const EnterRaffleStep: React.FC<EnterRaffleStepProps> = ({
  nextStep,
  prevStep,
  verifiedToken,
}) => {
  const { principalId } = usePlugStore();
  const snackbar = useSnackbar();
  const { request, isLoading, response, error } = useHttp({
    method: 'post',
    url: createLambdaUrl(LambdaEndpoint.NewTicket),
  });

  const handleNextStep = (): void => {
    request({
      body: { principalId },
      headers: { Authorization: createBearerToken(verifiedToken) },
    });
  };

  useEffect(() => {
    if (!response) return;

    nextStep();
  }, [response]);

  useEffect(() => {
    if (!error) return;
    snackbar.push({
      message: 'An error ocurred, please try again later!',
      gradient: 'fail',
    });
  }, [error]);

  return (
    <>
      <StyledModal.Title>Enter Raffle</StyledModal.Title>
      <StyledModal.Text>
        You will get 1 Raffle Ticket, which gives you a chance to win an NFT on
        drop day. You will know whether you've won or not on the day of the
        drop.
      </StyledModal.Text>

      <StyledModal.Footer>
        <Button variant="outlined" onClick={prevStep} size="large">
          Cancel
        </Button>
        <GradientButton
          onClick={handleNextStep}
          size="large"
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : 'Enter Raffle'}
        </GradientButton>
      </StyledModal.Footer>
    </>
  );
};

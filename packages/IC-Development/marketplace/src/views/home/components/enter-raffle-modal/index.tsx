import { ModalLayoutStyles as StyledModal } from '@/components/modal-layout';
import {
  RaffleTicketStatus,
  selectRaffleState,
  setRaffleTicketStatus,
  setRaffleTotalEntries,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import Modal from '@mui/material/Modal';
import React, { useState } from 'react';
import { CaptchaStep } from './captcha-step';
import { EnterRaffleStep } from './enter-raffle-step';

export enum EnterRaffleModalStep {
  Captcha,
  EnterRaffle,
}

export type EnterRaffleModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const EnterRaffleModal: React.FC<EnterRaffleModalProps> = ({
  open,
  setOpen,
}) => {
  const dispatch = useAppDispatch();
  const { totalEntries } = useAppSelector(selectRaffleState);
  const [step, setStep] = useState<EnterRaffleModalStep>(
    EnterRaffleModalStep.Captcha
  );
  const [verifiedToken, setVerifiedToken] = useState<string>();

  const handleClose = (): void => {
    setOpen(false);
  };

  const finishRaffle = () => {
    handleClose();
    dispatch(setRaffleTotalEntries(totalEntries + 1));
    dispatch(setRaffleTicketStatus(RaffleTicketStatus.Entered));
  };

  const steps = {
    [EnterRaffleModalStep.Captcha]: (
      <CaptchaStep
        prevStep={handleClose}
        nextStep={(token) => {
          setStep(EnterRaffleModalStep.EnterRaffle);
          setVerifiedToken(token);
        }}
      />
    ),
    [EnterRaffleModalStep.EnterRaffle]: (
      <EnterRaffleStep
        prevStep={() => setStep(EnterRaffleModalStep.Captcha)}
        nextStep={finishRaffle}
        verifiedToken={verifiedToken}
      />
    ),
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <StyledModal.Container>{steps[step]}</StyledModal.Container>
    </Modal>
  );
};

import { selectSnackbarState, useAppSelector } from '@/store';
import { IconButton, Theme } from '@mui/material';
import Slide, { SlideProps } from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from '@react-icons/all-files/fa/FaTimes';
import { SnackbarStyles as Styled } from './styles';
import { useSnackbar } from './use-snackbar';

const DEFAULT_TIMEOUT = 3000;

export type AppSnackbarProps = {
  message: string;
  icon?: React.ReactNode;
  gradient?: keyof Theme['gradient'];
  timeout?: number;
};

export const AppSnackbar: React.FC = () => {
  const snackbarController = useSnackbar();
  const { snacks } = useAppSelector(selectSnackbarState);
  const [props, setProps] = useState<AppSnackbarProps>();

  const Transition = useMemo(
    () => (slideProps: SlideProps) =>
      <Slide {...slideProps} direction="up" exit={true} />,
    []
  );

  const handleOpen = () => {
    if (!props && snacks.length > 0) {
      setProps(snacks[0]);
      snackbarController.pop();
    }
  };

  useEffect(() => {
    handleOpen();
  }, [snacks]);

  useEffect(() => {
    if (props) {
      const timeout = setTimeout(
        () => setProps(undefined),
        props.timeout || DEFAULT_TIMEOUT
      );
      return () => clearTimeout(timeout);
    } else {
      handleOpen();
    }
  }, [props]);

  return (
    <Snackbar
      open={Boolean(props)}
      TransitionComponent={Transition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      key={Transition.name}
    >
      <Styled.Container gradient={props?.gradient} elevation={3}>
        <Styled.Content>
          {props?.icon && (
            <Styled.IconContainer>{props.icon}</Styled.IconContainer>
          )}
          <span>{props?.message}</span>
          {props && (
            <IconButton size="small" onClick={() => setProps(undefined)}>
              <FaTimes />
            </IconButton>
          )}
          {snacks.length > 0 && (
            <Styled.Counter gradient={props?.gradient}>
              +{snacks.length}
            </Styled.Counter>
          )}
        </Styled.Content>
      </Styled.Container>
    </Snackbar>
  );
};

export * from './use-snackbar';

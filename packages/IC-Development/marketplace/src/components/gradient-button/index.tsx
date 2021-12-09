import React, { forwardRef } from 'react';
import { GradientButtonStyles as Styled } from './styles';
import { ButtonProps } from '@mui/material/Button';

export type GradientButtonProps = Omit<ButtonProps, 'color' | 'variant'> &
  Partial<Styled.ContainerProps>;

export const GradientButton: React.FC<GradientButtonProps> = forwardRef(
  ({ gradient = 'default', ...props }, ref) => {
    return <Styled.Container ref={ref} {...props} gradient={gradient} />;
  }
);

GradientButton.displayName = 'GradientButton';

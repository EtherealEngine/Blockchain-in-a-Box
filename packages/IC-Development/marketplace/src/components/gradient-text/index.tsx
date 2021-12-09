import React from 'react';
import { GradientTextStyles as Styled } from './styles';

export type GradientTextProps = React.PropsWithChildren<
  Partial<Styled.ContainerProps>
>;

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  gradient = 'default',
}) => {
  return <Styled.Container gradient={gradient}>{children}</Styled.Container>;
};

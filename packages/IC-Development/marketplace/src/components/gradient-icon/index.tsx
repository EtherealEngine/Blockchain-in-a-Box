import { FC, HTMLAttributes } from 'react';
import { GradientIconStyles as Styled } from './styles';

type GradientIconProps = HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

export const GradientIcon: FC<GradientIconProps> = ({
  size = 'md',
  icon,
  ...props
}: GradientIconProps) => (
  <Styled.IconContainer size={size} {...props}>
    {icon}
  </Styled.IconContainer>
);

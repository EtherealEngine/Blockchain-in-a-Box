import React from 'react';
import { FaInfoCircle } from '@react-icons/all-files/fa/FaInfoCircle';
import Tooltip from '@mui/material/Tooltip';

import { LabeledContainerStyles as Styled } from './styles';

export type LabeledContainerProps = React.PropsWithChildren<{
  label: string;
  tooltip?: string;
  icon?: string;
}>;

export const LabeledContainer: React.FC<LabeledContainerProps> = ({
  label,
  tooltip,
  icon,
  children,
}) => {
  return (
    <Styled.Container>
      <Styled.Label>
        {label}
        {tooltip && (
          <Tooltip title={tooltip}>
            <span className="tooltip-icon">
              <FaInfoCircle />
            </span>
          </Tooltip>
        )}
      </Styled.Label>
      <Styled.DataRow>
        {icon && <Styled.Icon src={icon} />}
        {children}
      </Styled.DataRow>
    </Styled.Container>
  );
};

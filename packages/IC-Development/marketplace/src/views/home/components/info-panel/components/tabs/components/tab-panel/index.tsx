import { FC } from 'react';
import { TabPanelStyles as Styled } from './styles';

type InfoTabPanelProps = {
  value: number;
  index: number;
};

export const InfoTabPanel: FC<InfoTabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`info-tabpanel-${index}`}
      aria-labelledby={`info-tab-${index}`}
      {...other}
    >
      {value === index && <Styled.Box>{children}</Styled.Box>}
    </div>
  );
};

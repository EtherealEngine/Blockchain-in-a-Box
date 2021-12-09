import { Tab } from '@mui/material';
import { useState, useMemo } from 'react';

import { TabDetails, TabHistory, InfoTabPanel } from './components';
import { InfoPanelStyles as Styled } from './styles';

function a11yProps(index: number) {
  return {
    id: `info-tab-${index}`,
    'aria-controls': `info-tabpanel-${index}`,
  };
}

export const InfoPanelTabs = () => {
  // const [value, setValue] = useState(0);
  // const handleChange = (_, newValue: number) => {
  //   setValue(newValue);
  // };

  // const tabs = useMemo(
  //   () => [
  //     {
  //       label: 'Details',
  //       content: <TabDetails />,
  //     },
  //     {
  //       label: 'Raffle History',
  //       content: <TabHistory />,
  //     },
  //   ],
  //   []
  // );

  return (
    <>
      {/* <Styled.Tabs value={value} onChange={handleChange} aria-label="Data tabs">
        {tabs.map(({ label }, index) => (
          <Tab key={label} label={label} {...a11yProps(index)} />
        ))}
      </Styled.Tabs>
      <Styled.Container>
        <Styled.Wrapper>
          {tabs.map(({ label, content }, index) => (
            <InfoTabPanel key={label} value={value} index={index}>
              {content}
            </InfoTabPanel>
          ))}
        </Styled.Wrapper>
      </Styled.Container> */}
      <Styled.Container>
        <Styled.Wrapper>
          <TabDetails />
        </Styled.Wrapper>
      </Styled.Container>
    </>
  );
};

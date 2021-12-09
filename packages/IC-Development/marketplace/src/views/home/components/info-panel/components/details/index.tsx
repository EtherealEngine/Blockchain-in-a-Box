import { LabeledContainer } from '@/components';
import { Box, Typography } from '@mui/material';
import { detailsData } from './constants';

type InfoPanelDetailsProps = {
  entries?: string | number;
  supply?: string | number;
};

export const InfoPanelDetails = ({
  entries = '-',
  supply = '-',
}: InfoPanelDetailsProps) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
      <LabeledContainer {...detailsData.entries}>
        <Typography component="h3" variant="h6">
          {numberWithCommas(entries)}
        </Typography>
      </LabeledContainer>
      <LabeledContainer {...detailsData.supply}>
        <Typography component="h3" variant="h6">
          {numberWithCommas(supply)}
        </Typography>
      </LabeledContainer>
    </Box>
  );
};

function numberWithCommas(x) {
  return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

import { Spinner } from '@/components';
import { useNftController } from '@/integrations/nft/use-nft-controller';
import { Button } from '@mui/material';
import { FaArrowLeft } from '@react-icons/all-files/fa/FaArrowLeft';
import { FaArrowRight } from '@react-icons/all-files/fa/FaArrowRight';
import { InfoPanelPagerStyles as Styled } from './styles';

export const InfoPanelPager = () => {
  const { next, prev, totalNfts, selectedIndex, isLoading } =
    useNftController();

  if (totalNfts <= 1) {
    return null;
  }

  return (
    <Styled.Container>
      <Styled.PrevContainer>
        {prev && (
          <Button onClick={prev}>
            <FaArrowLeft />
            &nbsp;&nbsp;&nbsp; Back
          </Button>
        )}
      </Styled.PrevContainer>
      <Styled.Content>
        {isLoading ? (
          <Spinner style={{ width: 25, height: 25 }} />
        ) : (
          <>
            {selectedIndex + 1} of {totalNfts}
          </>
        )}
      </Styled.Content>

      <Styled.NextContainer>
        {next && (
          <Button onClick={next}>
            Next&nbsp;&nbsp;&nbsp;
            <FaArrowRight />
          </Button>
        )}
      </Styled.NextContainer>
    </Styled.Container>
  );
};

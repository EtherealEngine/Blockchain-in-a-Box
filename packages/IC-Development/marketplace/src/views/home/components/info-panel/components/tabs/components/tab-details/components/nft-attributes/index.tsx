import { useMemo } from 'react';
import { LabeledContainerStyles } from '@/components/labeled-container/styles';
import { AttributeCell } from './attribute-cell';
import { AttributesStyles as Styled } from './styles';
import { useNft } from '@/integrations/nft';
import { getRarity, nftAmount } from './constants';

const defaultSelectedCrownAttirbutes = {
  small: {
    label: 'None',
    rarity: 0,
  },
  large: {
    label: 'None',
    rarity: 0,
  },
  base: {
    label: 'None',
    rarity: 0,
  },
  rim: {
    label: 'None',
    rarity: 0,
  },
};

export const NFTAttributes: React.FC = () => {
  const selectedCrown = useNft();

  const { small, large, base, rim } =
    useMemo(() => {
      return selectedCrown?.key_val_data?.reduce((acc, current) => {
        const trait = current?.val?.TextContent;
        switch (current.key) {
          case 'smallgem':
            return {
              ...acc,
              small: {
                label: trait,
                rarity: getRarity(nftAmount.small[trait]),
              },
            };
          case 'biggem':
            return {
              ...acc,
              large: {
                label: trait,
                rarity: getRarity(nftAmount.large[trait]),
              },
            };
          case 'base':
            return {
              ...acc,
              base: {
                label: trait,
                rarity: getRarity(nftAmount.base[trait]),
              },
            };
          case 'rim':
            return {
              ...acc,
              rim: {
                label: trait,
                rarity: getRarity(nftAmount.rim[trait]),
              },
            };
          default:
            return acc;
        }
      }, defaultSelectedCrownAttirbutes);
    }, [selectedCrown]) ?? defaultSelectedCrownAttirbutes;

  if (!selectedCrown) {
    return null;
  }

  return (
    <Styled.Container>
      <Styled.TitleContainer>
        <LabeledContainerStyles.Label>Attributes</LabeledContainerStyles.Label>
      </Styled.TitleContainer>
      <Styled.Row>
        <AttributeCell label="Small Stones" trait={small} />
        <AttributeCell label="Large Stone" trait={large} />
      </Styled.Row>
      <Styled.Row>
        <AttributeCell label="Base Layer" trait={base} />
        <AttributeCell label="Rim" trait={rim} />
      </Styled.Row>
    </Styled.Container>
  );
};

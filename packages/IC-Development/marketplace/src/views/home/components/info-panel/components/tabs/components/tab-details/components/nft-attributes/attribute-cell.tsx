import { AttributesStyles as Styled } from './styles';

export type AttributeCellProps = {
  label: string;
  trait: {
    rarity?: number;
    label?: string;
  };
};

export const AttributeCell: React.FC<AttributeCellProps> = ({
  label,
  trait,
}) => {
  return (
    <Styled.Cell>
      <Styled.CellLabel>{label}</Styled.CellLabel>
      <Styled.CellTrait variant="h6">{trait.label}</Styled.CellTrait>
      <Styled.CellPercentage>
        {trait.rarity}% have this trait
      </Styled.CellPercentage>
    </Styled.Cell>
  );
};

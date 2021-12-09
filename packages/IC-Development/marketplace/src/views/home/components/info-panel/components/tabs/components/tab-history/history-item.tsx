import { Emoji } from '@/components';
import { cutPrincipalId } from '@/components/plug-principal-id-chip/utils';
import { CapHistoryLog } from '@/models';
import React, { useMemo } from 'react';
import { FaExternalLinkAlt } from '@react-icons/all-files/fa/FaExternalLinkAlt';
import { TabHistoryStyles as Styled } from './styles';

export const TabHistoryItem: React.FC<CapHistoryLog & { emoji: string }> = ({
  emoji,
  details: [[, { Principal: principal }]],
  time,
}) => {
  const principalId = useMemo(() => principal.toText(), [principal]);

  const shortenedPrincipalId = useMemo(
    () => cutPrincipalId(principalId),
    [principalId]
  );

  const date = useMemo(() => new Date(Number(time)).toLocaleString(), [time]);

  const handleClick = () => {
    window.open(`https://ic.rocks/principal/${principalId}`, '_blank');
  };
  return (
    <Styled.ItemContainer onClick={handleClick}>
      <Emoji label="Fire" style={{ fontSize: '24px' }}>
        {emoji}
      </Emoji>
      <Styled.ItemData>
        <Styled.ItemLog>
          <span className="highlighted">{shortenedPrincipalId}</span>&nbsp; has
          entered the raffle.
        </Styled.ItemLog>
        <Styled.ItemDate>
          {date}&nbsp;
          <FaExternalLinkAlt />
        </Styled.ItemDate>
      </Styled.ItemData>
    </Styled.ItemContainer>
  );
};

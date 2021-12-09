import { Spinner, useSnackbar } from '@/components';
import { getRaffleHistory } from '@/integrations/cap';
import { CapHistoryLog } from '@/models';
import { Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { TabHistoryItem } from './history-item';
import { TabHistoryStyles as Styled } from './styles';

export const TabHistory = () => {
  const [history, setHistory] = useState<CapHistoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const hasHistory = useMemo(() => history.length > 0, [history]);

  const historyWithRandomCelebrationEmojis = useMemo(() => {
    if (hasHistory) {
      const getRandomCelebrationEmoji = () => {
        const emojis = ['🎉', '🎊', '🍾', '🚀', '🔥'];
        return emojis[Math.floor(Math.random() * emojis.length)];
      };

      return history.map((data) => ({
        ...data,
        emoji: getRandomCelebrationEmoji(),
      }));
    }

    return undefined;
  }, [hasHistory]);

  const snackbar = useSnackbar();

  useEffect(() => {
    setIsLoading(true);
    getRaffleHistory()
      .then((res) => {
        const newHistory = res;
        const newEntries = newHistory.filter(
          (item) => item.operation === 'new_entry'
        );
        setHistory(newEntries);
      })
      .catch((error) => {
        console.error(error);
        snackbar.push({
          message: 'Failed to load raffle history',
          gradient: 'fail',
        });
        setHistory([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Styled.Container>
      {isLoading ? (
        <Spinner style={{ padding: '190px' }} />
      ) : hasHistory ? (
        historyWithRandomCelebrationEmojis.map((h) => (
          <TabHistoryItem {...h} key={Number(h.time)} />
        ))
      ) : (
        <Typography variant="h5">No history</Typography>
      )}
    </Styled.Container>
  );
};

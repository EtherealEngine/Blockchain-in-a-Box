import { FeatureState, useNftControllerStore } from '@/store';
import { useMemo } from 'react';

export const useNftController = () => {
  const { ownedIds, selectedIndex, state, setSelectedCrownIndex } =
    useNftControllerStore();

  const next = useMemo(() => {
    if (state === FeatureState.Loading) return;
    if (selectedIndex === undefined) return;
    if (ownedIds === undefined) return;
    if (selectedIndex >= ownedIds.length - 1) return;
    return () => setSelectedCrownIndex(selectedIndex + 1);
  }, [ownedIds, selectedIndex, state]);

  const prev = useMemo(() => {
    if (state === FeatureState.Loading) return;
    if (selectedIndex === undefined) return;
    if (ownedIds === undefined) return;
    if (selectedIndex <= 0) return;
    return () => setSelectedCrownIndex(selectedIndex - 1);
  }, [ownedIds, selectedIndex, state]);

  const totalNfts = useMemo(() => {
    if (ownedIds === undefined) return 0;
    return ownedIds.length;
  }, [ownedIds]);

  const selectedId = useMemo(() => {
    if (selectedIndex === undefined) return;
    if (ownedIds === undefined) return;
    return ownedIds[selectedIndex];
  }, [ownedIds, selectedIndex]);

  return {
    prev,
    next,
    ownedIds,
    selectedIndex,
    totalNfts,
    selectedId,
    isLoading: state === FeatureState.Loading,
  };
};

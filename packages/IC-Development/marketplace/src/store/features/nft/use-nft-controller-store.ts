import {
  FeatureState,
  selectNftControllerState,
  setNftState,
  setOwnedNftIds,
  setSelectedNftIndex,
  useAppDispatch,
  useAppSelector,
} from '@/store';

export const useNftControllerStore = () => {
  const dispatch = useAppDispatch();
  const { ownedIds, selectedIndex, state } = useAppSelector(
    selectNftControllerState
  );

  const setSelectedCrownIndex = (index: number) => {
    dispatch(setSelectedNftIndex(index));
  };

  const _setNftState = (state: FeatureState) => {
    dispatch(setNftState(state));
  };

  const setOwnedCrownIds = (ids: number[]) => {
    dispatch(setOwnedNftIds(ids));
  };

  return {
    ownedIds,
    selectedIndex,
    state,
    setSelectedCrownIndex,
    setNftState: _setNftState,
    setOwnedCrownIds,
  };
};

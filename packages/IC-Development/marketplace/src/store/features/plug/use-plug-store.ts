import {
  FeatureState,
  selectPlugState,
  setIsConnected,
  setPrincipalId,
  setPlugState,
} from '@/store';

import { useAppDispatch, useAppSelector } from '@/store';

export const usePlugStore = () => {
  const { isConnected, principalId, state } = useAppSelector(selectPlugState);
  const dispatch = useAppDispatch();

  const _setIsConnected = (isConnected: boolean) => {
    dispatch(setIsConnected(isConnected));
  };

  const _setPrincipalId = (principalId?: string) => {
    dispatch(setPrincipalId(principalId));
  };

  const _setPlugState = (state: FeatureState) => {
    dispatch(setPlugState(state));
  };

  return {
    isConnected,
    principalId,
    state,
    setIsConnected: _setIsConnected,
    setPrincipalId: _setPrincipalId,
    setPlugState: _setPlugState,
  };
};

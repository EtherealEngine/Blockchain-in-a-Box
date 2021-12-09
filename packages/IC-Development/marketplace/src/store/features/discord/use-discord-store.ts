import {
  DiscordUser,
  FeatureState,
  selectDiscordState,
  setDiscordState,
  setUser,
} from '@/store';

import { useAppDispatch, useAppSelector } from '@/store';
import { useMemo } from 'react';

export const useDiscordStore = () => {
  const { state, user } = useAppSelector(selectDiscordState);
  const dispatch = useAppDispatch();

  const isDiscordAuthenticated = useMemo(() => {
    return Boolean(user?.id);
  }, []);

  const _setUser = (user: DiscordUser) => {
    dispatch(setUser(user));
  };

  const _setDiscordState = (state: FeatureState) => {
    dispatch(setDiscordState(state));
  };

  return {
    user,
    state,
    isDiscordAuthenticated,
    setUser: _setUser,
    setDiscordState: _setDiscordState,
  };
};

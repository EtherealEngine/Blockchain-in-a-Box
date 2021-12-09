import { useEffect } from 'react';

import {
  removeFromStorage,
  getFromStorage,
  LocalStorageKey,
} from '@/config/local-storage';
import { useDiscordStore } from '@/store';

export const useAccessTokenExpires = () => {
  const { setUser } = useDiscordStore();

  useEffect(() => {
    const removeUserData = () => {
      removeFromStorage(LocalStorageKey.DiscordAccessToken);
      setUser(undefined);
    };

    const expiresIn = getFromStorage(LocalStorageKey.DiscordExpiresIn);

    if (!expiresIn) {
      removeUserData();
    }

    if (expiresIn) {
      const isAccessTokenExpired = Number(expiresIn) < Date.now();

      if (isAccessTokenExpired) {
        removeUserData();
      }
    }
  }, []);
};

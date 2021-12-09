import {
  getFromStorage,
  LocalStorageKey,
  removeFromStorage,
  saveToStorage,
} from '@/config';
import { DiscordUser, FeatureState, useDiscordStore } from '@/store';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useHttp } from '../http';
import { createBearerToken } from '@/utils';
import { useSnackbar } from '@/components';
import { DISCORD_USERS_URL } from '.';

export const useDiscordInit = () => {
  const { setDiscordState, setUser } = useDiscordStore();
  const location = useLocation();
  const snackbar = useSnackbar();

  const { isLoading, request } = useHttp<any, DiscordUser>({
    url: DISCORD_USERS_URL,
    method: 'get',
  });

  useEffect(() => {
    const getDiscordProfile = async () => {
      let accessToken = getFromStorage(LocalStorageKey.DiscordAccessToken);

      const fragment = new URLSearchParams(location.hash.slice(1));
      const [_accessToken, expiresInTime, error] = [
        fragment.get('access_token'),
        fragment.get('expires_in'),
        fragment.get('error'),
      ];

      if (error) {
        removeFromStorage(LocalStorageKey.DiscordExpiresIn);
        removeFromStorage(LocalStorageKey.DiscordAccessToken);
        return;
      }

      if (!accessToken && location.hash) {
        const expiresIn = Number(expiresInTime) * 1000 + Date.now();

        saveToStorage(LocalStorageKey.DiscordExpiresIn, expiresIn.toString());

        accessToken = _accessToken;
      }

      if (accessToken) {
        try {
          const response = await request({
            headers: {
              Authorization: createBearerToken(accessToken),
            },
          });

          setUser(response.data);
          saveToStorage(LocalStorageKey.DiscordAccessToken, accessToken);
        } catch (err) {
          console.log(err);
          snackbar.push({
            message: 'Failed to fetch discord profile',
            gradient: 'fail',
          });
          setUser(undefined);
          removeFromStorage(LocalStorageKey.DiscordAccessToken);
          removeFromStorage(LocalStorageKey.DiscordExpiresIn);
        }
      }
    };

    getDiscordProfile();
  }, []);

  useEffect(() => {
    setDiscordState(isLoading ? FeatureState.Loading : FeatureState.Idle);
  }, [isLoading]);
};

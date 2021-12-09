import { FeatureState, usePlugStore } from '@/store';
import { useEffect } from 'react';
import { checkIsConnected, getPrincipal } from '.';

export const usePlugInit = () => {
  const { isConnected, setIsConnected, setPlugState, setPrincipalId } =
    usePlugStore();

  useEffect(() => {
    setPlugState(FeatureState.Loading);

    const connectionPromise = checkIsConnected();

    if (connectionPromise) {
      connectionPromise
        .then(async (isConnected) => {
          if (isConnected) {
            const hasPrincipal = await getPrincipal();
            if (hasPrincipal) return setIsConnected(isConnected);
          }
          return setIsConnected(false);
        })
        .catch((err) => {
          console.error(err);
          setIsConnected(false);
          setPlugState(FeatureState.Error);
        });
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      const getPrincipalId = async () => {
        try {
          const principal = await getPrincipal();

          if (principal) {
            if (typeof principal === 'string') {
              setPrincipalId(principal as unknown as string);
            } else {
              setPrincipalId(principal.toText());
            }
          }
          setPlugState(FeatureState.Idle);
        } catch (err) {
          console.error(err);
          setPlugState(FeatureState.Error);
        }
      };

      const isPlug = Boolean(window?.ic?.plug);
      if (isPlug) {
        getPrincipalId();
      }
    }

    setPlugState(FeatureState.Idle);
  }, [isConnected]);
};

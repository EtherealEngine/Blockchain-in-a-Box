import { useEffect, useState } from 'react';

import { ActorAdapter } from './actor-adapter';
import { ActorProps, AppActors } from './models';

import { usePlugStore } from '@/store';

export const useActor = <T extends AppActors>(
  props: ActorProps
): T | undefined => {
  const [actor, setActor] = useState<T>();
  const { isConnected } = usePlugStore();

  useEffect(() => {
    if (isConnected) {
      new ActorAdapter(window.ic.plug)
        .createActor<T>(props.canisterId, props.interfaceFactory)
        .then((newActor) => setActor(newActor))
        .catch((error) => console.error(error));
    } else {
      setActor(undefined);
    }
  }, [isConnected]);

  return actor;
};

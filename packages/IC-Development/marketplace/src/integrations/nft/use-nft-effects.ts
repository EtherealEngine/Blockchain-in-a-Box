import { useSnackbar } from '@/components';
import { RaffleStatus } from '@/models';
import {
  FeatureState,
  RaffleTicketStatus,
  selectRaffleState,
  setRaffleTicketStatus,
  useAppDispatch,
  useAppSelector,
  useNftControllerStore,
  usePlugStore,
} from '@/store';
import { Principal } from '@dfinity/principal';
import { useEffect } from 'react';
import { useNFTActor } from '.';

export const useNftEffects = () => {
  const snackbar = useSnackbar();

  const dispatch = useAppDispatch();
  const { raffleStatus } = useAppSelector(selectRaffleState);

  const { principalId } = usePlugStore();
  const { ownedIds, setNftState, setOwnedCrownIds, setSelectedCrownIndex } =
    useNftControllerStore();

  const nftActor = useNFTActor();

  useEffect(() => {
    // Fetch owned ids if raffle finished and we have a principal
    if (raffleStatus !== RaffleStatus.Finished || !principalId || !nftActor)
      return;

    setNftState(FeatureState.Loading);
    nftActor
      .getTokenIdsForUserDip721(Principal.from(principalId))
      .then((bigintIds) => {
        const ids = bigintIds.map((id) => Number(id));

        setOwnedCrownIds(ids);
      })
      .catch((error) => {
        console.log(error.message);
        snackbar.push({
          message: error.message,
          gradient: 'fail',
        });
      })
      .finally(() => {
        setNftState(FeatureState.Idle);
      });
  }, [raffleStatus, principalId, nftActor]);

  useEffect(() => {
    // Update ticket status if we have owned ids
    if (!ownedIds) return;

    if (ownedIds.length > 0) {
      dispatch(setRaffleTicketStatus(RaffleTicketStatus.Won));
      setSelectedCrownIndex(0);
    } else {
      dispatch(setRaffleTicketStatus(RaffleTicketStatus.Lost));
    }
  }, [ownedIds]);
};

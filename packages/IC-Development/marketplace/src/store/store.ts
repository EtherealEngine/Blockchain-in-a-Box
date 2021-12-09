import { configureStore } from '@reduxjs/toolkit';

import discordReducer from '@/store/features/discord/discord-slice';
import plugReducer from '@/store/features/plug/plug-slice';
import snackbarReducer from './features/snackbar/snackbar-slice';
import raffleReducer from '@/store/features/raffle/raffle-slice';
import nftControllerReducer from '@/store/features/nft/nft-controller-slice';
import nftReducer from '@/store/features/nft/nft-slice';

export const store = configureStore({
  reducer: {
    discord: discordReducer,
    plug: plugReducer,
    snackbar: snackbarReducer,
    raffle: raffleReducer,
    nftController: nftControllerReducer,
    nft: nftReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

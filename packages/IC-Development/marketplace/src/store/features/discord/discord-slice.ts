import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeatureState, RootState } from '@/store';

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  discriminator?: string;
  public_flags?: number;
}

// Define a type for the slice state
interface DiscordState {
  user?: DiscordUser;
  state: FeatureState;
}

// Define the initial state using that type
const initialState: DiscordState = {
  user: undefined,
  state: FeatureState?.Idle,
};

export const discordSlice = createSlice({
  name: 'discord',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<DiscordUser | undefined>) {
      state.user = action.payload;
    },
    setState(state, action: PayloadAction<FeatureState>) {
      state.state = action.payload;
    },
  },
});

export const { setState: setDiscordState, setUser } = discordSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectDiscordState = (state: RootState) => state.discord;

export default discordSlice.reducer;

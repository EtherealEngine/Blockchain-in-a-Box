import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeatureState, RootState } from '@/store';

// Define a type for the slice state
interface NftController {
  state?: FeatureState;
  selectedIndex?: number;
  ownedIds?: number[];
}

// Define the initial state using that type
const initialState: NftController = {
  state: undefined,
  selectedIndex: undefined,
  ownedIds: undefined,
};

export const nftController = createSlice({
  name: 'nftController',
  initialState,
  reducers: {
    setSelectedIndex(state, action: PayloadAction<number | undefined>) {
      state.selectedIndex = action.payload;
    },
    setState(state, action: PayloadAction<FeatureState>) {
      state.state = action.payload;
    },
    setOwnedIds(state, action: PayloadAction<number[] | undefined>) {
      state.ownedIds = action.payload;
    },
  },
});

export const {
  setSelectedIndex: setSelectedNftIndex,
  setState: setNftState,
  setOwnedIds: setOwnedNftIds,
} = nftController.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectNftControllerState = (state: RootState) =>
  state.nftController;

export default nftController.reducer;

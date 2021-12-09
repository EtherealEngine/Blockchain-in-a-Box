import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeatureState, RootState } from '@/store';
import { NFT } from '@/models';

// Define a type for the slice state
interface NftState {
  nfts?: NFT[];
  selectedNft?: NFT;
}

// Define the initial state using that type
const initialState: NftState = {
  nfts: undefined,
  selectedNft: undefined,
};

export const nftSlice = createSlice({
  name: 'nft',
  initialState,
  reducers: {
    setSelectedNft(state, action: PayloadAction<NFT | undefined>) {
      state.selectedNft = action.payload;
    },
    setNfts(state, action: PayloadAction<NFT[] | undefined>) {
      state.nfts = action.payload;
    },
  },
});

export const { setSelectedNft, setNfts } = nftSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectNftState = (state: RootState) => state.nft;

export default nftSlice.reducer;

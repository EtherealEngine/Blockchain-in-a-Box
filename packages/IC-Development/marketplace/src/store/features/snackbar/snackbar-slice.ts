import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { AppSnackbarProps } from '@/components';

// Define a type for the slice state
interface SnackbarState {
  snacks: AppSnackbarProps[];
}

// Define the initial state using that type
const initialState: SnackbarState = {
  snacks: [],
};

export const snackbarSlice = createSlice({
  name: 'snackbar',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    pushSnackbar: (state, action: PayloadAction<AppSnackbarProps>) => {
      state.snacks = [...state.snacks, action.payload];
    },
    popSnackbar: (state) => {
      state.snacks = state.snacks.slice(1);
    },
  },
});

export const { pushSnackbar, popSnackbar } = snackbarSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectSnackbarState = (state: RootState) => state.snackbar;

export default snackbarSlice.reducer;

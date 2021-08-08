import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SetupState = {
  notifications: string[];
};

const initialState = {
  notifications: [],
} as SetupState;

const setupReducer = createSlice({
  name: "setup",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<string>) {
      state.notifications.push(action.payload);
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(
        (item) => item !== action.payload
      );
    },
  },
});

export const { addNotification, removeNotification } = setupReducer.actions;

export default setupReducer.reducer;

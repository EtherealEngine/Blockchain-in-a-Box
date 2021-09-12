import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SetupState = {
  setupLoader: boolean
  notifications: any;
  result: Object
};

const initialState = {
  notifications: {},
  result: {},
  setupLoader: false
} as SetupState;

const setupReducer = createSlice({
  name: "setup",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<any>) {

      // state.notifications.push(action.payload);
      state.setupLoader = true;
    },
    addNotificationSuccess(state, action: PayloadAction<any>) {
      console.log("REDUCER ", action);
      state.notifications = [];
      state.notifications = { ...action.payload }
      state.setupLoader = false;
    },
    removeNotification(state, action: PayloadAction<string>) {
      // state.notifications = state.notifications.filter(
      //   (item) => item !== action.payload
      // );
      state.setupLoader = false;

    },
  },
});

export const { addNotification, removeNotification, addNotificationSuccess } = setupReducer.actions;

export default setupReducer.reducer;

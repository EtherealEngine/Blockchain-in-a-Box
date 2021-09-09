import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SetupState = {
  notifications: any;
  result: Object
};

const initialState = {
  notifications: {},
  result: {}
} as SetupState;

const setupReducer = createSlice({
  name: "setup",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<string>) {

      // state.notifications.push(action.payload);
    },
    addNotificationSuccess(state, action: PayloadAction<any>) {
      console.log("REDUCER ", action);
      state.notifications = [];
      state.notifications = { ...action.payload }
    },
    removeNotification(state, action: PayloadAction<string>) {
      // state.notifications = state.notifications.filter(
      //   (item) => item !== action.payload
      // );
    },
  },
});

export const { addNotification, removeNotification, addNotificationSuccess } = setupReducer.actions;

export default setupReducer.reducer;

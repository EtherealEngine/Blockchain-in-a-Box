import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SetupState = {
  setupLoader: boolean
  notifications: any;
  result: Object,
  deploymentLoading: boolean,
  deploymentStatus: any
};

const initialState = {
  notifications: {},
  result: {},
  setupLoader: false,
  deploymentLoading: false,
  deploymentStatus: {}
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

    setDeployment(state, action: PayloadAction<any>) {
      state.deploymentLoading = true;
    },
    deploymentSuccess(state, action: PayloadAction<any>) {
      state.notifications = action.payload;
      state.deploymentLoading = false;
    },
    deploymentFaliure(state, action: PayloadAction<any>) {
      state.deploymentStatus = action.payload;
      state.deploymentLoading = false;
    }
  },
});

export const { addNotification, removeNotification, addNotificationSuccess, setDeployment, deploymentSuccess, deploymentFaliure } = setupReducer.actions;

export default setupReducer.reducer;

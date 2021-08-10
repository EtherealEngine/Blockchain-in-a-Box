import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LoggedInState } from "../../models/Admin";

type AdminState = {
  loadingMessage: string;
  loginState: LoggedInState;
  email: string;
  loginToken: string;
  authToken: string;
  error: string;
};

const initialState = {
  loadingMessage: "Getting information",
  loginState: LoggedInState.None,
  email: "",
  loginToken: "",
  authToken: "",
  error: "",
} as AdminState;

const adminReducer = createSlice({
  name: "admin",
  initialState,
  reducers: {
    checkFirstTimeLogin(state) {
      state.loadingMessage = "Getting information";
    },
    setFirstTimeLogin(state, action: PayloadAction<LoggedInState>) {
      state.loadingMessage = "";
      state.error = "";
      state.loginState = action.payload;
    },
    checkAdminLogin(state, action: PayloadAction<string>) {
      state.loadingMessage = "Authenticating";
      state.error = "";
    },
    setAdmin(state, action: PayloadAction<string[]>) {
      state.loadingMessage = "";
      state.error = "";
      state.loginState = LoggedInState.Recurring;
      state.email = action.payload[0];
      state.loginToken = action.payload[1];
      state.authToken = action.payload[2];
    },
    setAdminError(state, action: PayloadAction<string>) {
      state.loadingMessage = "";
      state.error = action.payload;
    },
  },
});

export const {
  checkFirstTimeLogin,
  setFirstTimeLogin,
  checkAdminLogin,
  setAdmin,
  setAdminError,
} = adminReducer.actions;

export default adminReducer.reducer;

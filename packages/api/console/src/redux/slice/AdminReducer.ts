import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LoggedInState } from "../../models/Admin";

type AdminState = {
  loadingMessage: string;
  loginState: LoggedInState;
  email: string;
  loginToken: string;
  accessToken: string;
  organizationName: string;
  error: string;
};

const initialState = {
  loadingMessage: "Getting information",
  loginState: LoggedInState.None,
  email: "",
  loginToken: "",
  accessToken: "",
  organizationName: "",
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
    setAdminAuthentication(state, action: PayloadAction<string[]>) {
      state.loadingMessage = "";
      state.error = "";
      state.loginState = LoggedInState.Recurring;
      state.email = action.payload[0];
      localStorage.setItem("email", action.payload[0]);
      state.loginToken = action.payload[1];
      state.accessToken = action.payload[2];
      state.organizationName = action.payload[3];
    },
    setAdminError(state, action: PayloadAction<string>) {
      state.loadingMessage = "";
      state.error = action.payload;
    },
    checkAdminAuthentication(state, action: PayloadAction<string[]>) {
      state.loadingMessage = "Authenticating";
      state.error = "";
    },
  },
});

export const {
  checkFirstTimeLogin,
  setFirstTimeLogin,
  checkAdminLogin,
  setAdminAuthentication,
  setAdminError,
  checkAdminAuthentication,
} = adminReducer.actions;

export default adminReducer.reducer;

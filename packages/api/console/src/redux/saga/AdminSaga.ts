/* eslint-disable import/no-anonymous-default-export */
import { Action } from "@reduxjs/toolkit";
import { takeLeading, put, call } from "redux-saga/effects";
import { GetAdminFirstTime } from "../../api/AdminApi";
import { AdminFirstTimeResponse, LoggedInState } from "../../models/Admin";
import {
  checkFirstTimeLogin,
  setAdminError,
  setFirstTimeLogin,
} from "../slice/AdminReducer";

function* CheckFirstTimeLoginAsync(action: Action) {
  if (checkFirstTimeLogin.match(action)) {
    try {
      const response: AdminFirstTimeResponse = yield call(GetAdminFirstTime);
      let status = response.firstTime
        ? LoggedInState.FirstTime
        : LoggedInState.Recurring;
      yield put(setFirstTimeLogin(status));
    } catch (err) {
      const error = new Error(err);
      yield put(setAdminError(error.message));
    }
  }
}

export default function* () {
  yield takeLeading(checkFirstTimeLogin.type, CheckFirstTimeLoginAsync);
}

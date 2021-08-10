/* eslint-disable import/no-anonymous-default-export */
import { Action } from "@reduxjs/toolkit";
import { takeLeading, put, call, takeLatest } from "redux-saga/effects";
import { push } from "connected-react-router";
import { GetAdminFirstTime, PostAdminLogin } from "../../api/AdminApi";
import { AdminFirstTimeResponse, LoggedInState } from "../../models/Admin";
import {
  checkAdminLogin,
  checkFirstTimeLogin,
  setAdminError,
  setFirstTimeLogin,
} from "../slice/AdminReducer";
import Routes from "../../constants/Routes";

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

function* CheckAdminLoginAsync(action: Action) {
  if (checkAdminLogin.match(action)) {
    try {
      yield call(PostAdminLogin, action.payload);
      yield put(push(`${Routes.LOGIN_VERIFICATION}?email=${action.payload}`));
    } catch (err) {
      const error = new Error(err);
      yield put(setAdminError(error.message));
    }
  }
}

export default function* () {
  yield takeLeading(checkFirstTimeLogin.type, CheckFirstTimeLoginAsync);
  yield takeLatest(checkAdminLogin.type, CheckAdminLoginAsync);
}

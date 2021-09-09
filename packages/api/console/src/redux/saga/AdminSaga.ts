/* eslint-disable import/no-anonymous-default-export */
import { Action } from "@reduxjs/toolkit";
import { takeLeading, put, call, takeLatest } from "redux-saga/effects";
import { push } from "connected-react-router";
import {
  GetAdminFirstTime,
  PostAdminAuthentication,
  PostAdminLogin,
} from "../../api/AdminApi";
import {
  AdminAuthenticationResponse,
  AdminFirstTimeResponse,
  LoggedInState,
} from "../../models/Admin";
import {
  checkAdminAuthentication,
  checkAdminLogin,
  checkFirstTimeLogin,
  setAdminAuthentication,
  setAdminError,
  setFirstTimeLogin,
} from "../slice/AdminReducer";
import Routes from "../../constants/Routes";
import { validateEmail } from "../../utilities/Utility";

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

function* CheckAdminAuthenticationAsync(action: Action) {
  if (checkAdminAuthentication.match(action)) {
    try {
      if (!action.payload[0]) {
        yield put(setAdminError("Email is missing in query parameters."));
        return;
      }

      if (validateEmail(action.payload[0]) === false) {
        yield put(setAdminError("Email is not valid."));
        return;
      }

      if (!action.payload[1]) {
        yield put(setAdminError("Token is missing in query parameters."));
        return;
      }

      const response: AdminAuthenticationResponse = yield call(
        PostAdminAuthentication,
        action.payload
      );

      yield put(
        setAdminAuthentication([
          action.payload[0],
          action.payload[1],
          response.accessToken,
          response.organizationName
        ])
      );
      if (response.organizationName) {
        yield put(push(Routes.DASHBOARD));
      } else {
        yield put(push(Routes.SETUP));
      }
    } catch (err) {
      const error = new Error(err);
      yield put(setAdminError(error.message));
    }
  }
}

export default function* () {
  yield takeLeading(checkFirstTimeLogin.type, CheckFirstTimeLoginAsync);
  yield takeLatest(checkAdminLogin.type, CheckAdminLoginAsync);
  yield takeLatest(
    checkAdminAuthentication.type,
    CheckAdminAuthenticationAsync
  );
}

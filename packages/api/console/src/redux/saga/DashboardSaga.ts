/* eslint-disable import/no-anonymous-default-export */
import { Action } from "@reduxjs/toolkit";
import { END, eventChannel } from "redux-saga";
import {
    takeLeading,
    put,
    call,
    select,
    takeEvery,
    take,
    takeLatest,
} from "redux-saga/effects";
import {
    getSideChainUrlSuccess, getSideChainUrl, getSideChainUrlFaliure, addUserDetails,
    addUserDetailsFailure, addUserDetailsSuccess, getUserList, getUserListFaliure, getUserListSuccess,
} from "../slice/DashboardReducer";
import {
    AddUserDataApi,
    GetSideChaninData,
    GetUserListData,
    DeploymentAPI
} from "../../api/DashboardApi";
import { addNotificationSuccess, setDeployment, deploymentSuccess, deploymentFaliure } from "../slice/SetupReducer";

function* GetSideChainFormData(action: Action) {
    console.log("DASHBOARD SAGS ", action);
    if (getSideChainUrl.match(action)) {
        try {
            const response: any = yield call(
                GetSideChaninData
            );
            console.log("response ", response);
            yield put(
                getSideChainUrlSuccess(response)
            );

        } catch (error) {
            yield put(
                getSideChainUrlFaliure()
            );
        }

    }

}

function* AddUserData(action: Action) {
    console.log("DASHBOARD USER ", action);
    if (addUserDetails.match(action)) {
        try {
            const response: any = yield call(
                AddUserDataApi, action.payload
            );
            console.log("response ", response);
            yield put(
                addUserDetailsSuccess(response)
            );

        } catch (error) {
            yield put(
                addUserDetailsFailure(error)
            );
        }

    }

}

function* GetUserList(action: Action) {
    console.log("DASHBOARD USER ", action);
    if (getUserList.match(action)) {
        try {
            const response: any = yield call(
                GetUserListData
            );
            console.log("response ", response);
            yield put(
                getUserListSuccess(response)
            );

        } catch (error) {
            yield put(
                getUserListFaliure(error)
            );
        }

    }

}

function* PostDeployment(action: Action) {
    console.log("deplo saga ", action);

    if (setDeployment.match(action)) {
        try {
            const response: any = yield call(
                DeploymentAPI, action.payload
            );
            console.log("response ", response);
            yield put(
                deploymentSuccess(response.User)
            );

        } catch (error) {
            yield put(
                addUserDetailsFailure(error)
            );
        }

    }

}

export default function* () {
    //   yield takeLeading(getScenes.type, FetchScenesDataAsync);
    yield takeLatest(getSideChainUrl.type, GetSideChainFormData);
    yield takeLatest(addUserDetails.type, AddUserData);
    yield takeLatest(getUserList.type, GetUserList);
    yield takeLatest(setDeployment.type, PostDeployment);

}
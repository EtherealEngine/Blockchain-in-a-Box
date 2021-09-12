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
import { getSideChainUrlSuccess, getSideChainUrl, getSideChainUrlFaliure } from "../slice/DashboardReducer";
import {
    GetSideChaninData
} from "../../api/DashboardApi";

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

export default function* () {
    //   yield takeLeading(getScenes.type, FetchScenesDataAsync);
    yield takeLatest(getSideChainUrl.type, GetSideChainFormData)
}
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
import { addNotification, addNotificationSuccess } from "../slice/SetupReducer";
import {
    PostSetupData
} from "../../api/SetupApi";

// function* FetchScenesDataAsync(action: Action) {
//   if (getScenes.match(action)) {
//     try {
//       const { errors, result, currentPage } = yield select(
//         (state: RootState) => state.scenes
//       );

//       // If page count is not 0 and current page is same as total page. Then maximum page limit is reached.
//       if (currentPage !== 0 && currentPage >= result.pages) {
//         return;
//       }

//       let page = currentPage;

//       // If there was no error then fetch next page results.
//       if (errors.length === 0) {
//         page++;
//       }

//       const scenes = yield call(GetScenes, page);
//       yield put(setScenes(scenes));
//     } catch (err) {
//       const error = new Error(err);
//       yield put(setScenesError(error.message));
//     }
//   }
// }

function* PostSetupDataApiCall(action: Action) {
    console.log("SETUP SAGS ", action);
    if (addNotification.match(action)) {
        const response: any = yield call(
            PostSetupData,
            action.payload
        );
        console.log("response ", { ...response, ...action.payload });
        if (response['Status'] == 200) {
            yield put(
                addNotificationSuccess({ ...action.payload, 'Status': 200 })
            );
        }


    }

}

export default function* () {
    //   yield takeLeading(getScenes.type, FetchScenesDataAsync);
    yield takeLatest(addNotification.type, PostSetupDataApiCall)
}

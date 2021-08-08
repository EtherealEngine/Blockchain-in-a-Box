// /* eslint-disable import/no-anonymous-default-export */
// import { Action } from "@reduxjs/toolkit";
// import { END, eventChannel } from "redux-saga";
// import {
//   takeLeading,
//   put,
//   call,
//   select,
//   takeEvery,
//   take,
// } from "redux-saga/effects";
// import { addNotification } from "../slice/SetupReducer";

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

// export default function* () {
//   yield takeLeading(getScenes.type, FetchScenesDataAsync);
// }

import { all } from 'redux-saga/effects';
import AdminSaga from './AdminSaga';
import SetupSaga from './SetupSaga';

export default function* rootSaga() {
  yield all([AdminSaga(), SetupSaga()]);
  // yield all([SetupSaga()]);
}

import { all } from 'redux-saga/effects';
import AdminSaga from './AdminSaga';

export default function* rootSaga() {
  yield all([AdminSaga()]);
}

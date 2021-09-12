import { all } from 'redux-saga/effects';
import AdminSaga from './AdminSaga';
import SetupSaga from './SetupSaga';
import DashboardSaga from './DashboardSaga';

export default function* rootSaga() {
  yield all([AdminSaga(), SetupSaga(), DashboardSaga()]);
  // yield all([SetupSaga()]);
}

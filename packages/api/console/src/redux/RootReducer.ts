import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import setupReducer from './slice/SetupReducer';
import adminReducer from './slice/AdminReducer';
import dashboardReducer from './slice/DashboardReducer';

const rootReducer = (history: any) => combineReducers({
  setup: setupReducer,
  admin: adminReducer,
  dashboard: dashboardReducer,
  router: connectRouter(history),
});

export default rootReducer;

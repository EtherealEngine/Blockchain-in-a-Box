import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import setupReducer from './slice/SetupReducer';
import adminReducer from './slice/AdminReducer';

const rootReducer = (history: any) => combineReducers({
  setup: setupReducer,
  admin: adminReducer,
  router: connectRouter(history),
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;

import { combineReducers } from '@reduxjs/toolkit';
import setupReducer from './slice/SetupReducer';
import adminReducer from './slice/AdminReducer';

const rootReducer = combineReducers({
  setup: setupReducer,
  admin: adminReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;

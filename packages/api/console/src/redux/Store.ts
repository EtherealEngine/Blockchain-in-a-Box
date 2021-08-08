import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './RootReducer';
// import rootSaga from './saga';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: rootReducer,
  middleware: (defaultMiddleware) => defaultMiddleware().concat(sagaMiddleware),
});

// sagaMiddleware.run(rootSaga);

export type AppDispatch = typeof store.dispatch;

export default store;

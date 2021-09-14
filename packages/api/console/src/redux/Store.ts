import { configureStore } from "@reduxjs/toolkit";
import { routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";
import createSagaMiddleware from "redux-saga";
import rootReducer from "./RootReducer";
import rootSaga from "./saga";

const sagaMiddleware = createSagaMiddleware();

export const history = createBrowserHistory();

const store = configureStore({
  reducer: rootReducer(history),
  middleware: (defaultMiddleware) =>
    defaultMiddleware({
      serializableCheck: false,
    })
      .concat(sagaMiddleware)
      .concat(routerMiddleware(history)),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch;

export default store;

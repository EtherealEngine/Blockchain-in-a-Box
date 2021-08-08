import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "@material-ui/core";
import { defaultTheme } from "./utilities/MuiThemes";
import { Provider } from "react-redux";
import store from "./redux/Store";
import "./index.css";

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <ThemeProvider theme={defaultTheme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>,
    document.getElementById("root")
  );
};

render();

declare global {
  interface Window {
    Store: any;
  }
}

window.Store = store;

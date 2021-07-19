import React from "react";
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from '@material-ui/core';
import { defaultTheme } from './utilities/MuiThemes';
import './index.css';

ReactDOM.render(
  <ThemeProvider theme={defaultTheme}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>,
  document.getElementById('root'),
);

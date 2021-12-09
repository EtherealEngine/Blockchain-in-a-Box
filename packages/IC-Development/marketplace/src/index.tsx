import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { theme } from '@/config';
import { ThemeProvider } from '@mui/material';

import { store } from './store';
import { App } from './App';

ReactDOM.render(
  <ReduxProvider store={store}>
    <ThemeProvider theme={theme}>
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  </ReduxProvider>,
  document.getElementById('main')
);

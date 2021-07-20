import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './components/Dashboard';
import Login from './components/Login';
import Routes from './constants/Routes';
import Welcome from './components/Welcome';

const Router: React.FunctionComponent = () => {
  return (
    <div>
      <Switch>
        <Route exact path={Routes.ROOT} component={Welcome} />
        <Route exact path={Routes.DASHBOARD} component={Home} />
        <Route exact path={Routes.LOGIN} component={Login} />
      </Switch>
    </div>
  );
}

export default Router;

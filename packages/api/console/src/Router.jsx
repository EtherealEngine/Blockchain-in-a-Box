import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import UpdateProfile from './components/UpdateProfile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import UpdatePassword from './components/UpdatePassword';
import Routes from './constants/Routes';
import Welcome from './components/Welcome';

const Router = () => (
  <div>
    <Switch>
      <Route exact path={Routes.ROOT} component={Welcome} />
      <Route exact path={Routes.HOME} component={Home} />
      <Route exact path={Routes.LOGIN} component={Login} />
      <Route exact path={Routes.REGISTER} component={Register} />
      <Route exact path={Routes.RESET} component={ResetPassword} />
      <Route exact path={Routes.FORGOT_PASSWORD} component={ForgotPassword} />
      <Route exact path={Routes.USER_PROFILE} component={Profile} />
      <Route exact path={Routes.UPDATE_USER} component={UpdateProfile} />
      <Route
        exact
        path={Routes.UPDATE_PASSWORD}
        component={UpdatePassword}
      />
    </Switch>
  </div>
);

export default Router;

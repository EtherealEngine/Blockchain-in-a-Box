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

const Routes = () => (
  <div>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/login" component={Login} />
      <Route exact path="/register" component={Register} />
      <Route exact path="/reset/:token" component={ResetPassword} />
      <Route exact path="/forgotPassword" component={ForgotPassword} />
      <Route exact path="/userProfile/:username" component={Profile} />
      <Route exact path="/updateUser/:username" component={UpdateProfile} />
      <Route
        exact
        path="/updatePassword/:username"
        component={UpdatePassword}
      />
    </Switch>
  </div>
);

export default Routes;

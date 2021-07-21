import React, { Fragment } from "react";
import { Switch, Route } from "react-router-dom";
import Home from "./components/Dashboard";
import Login from "./components/Login";
import LoginVerification from "./components/LoginVerification";
import Routes from "./constants/Routes";
import Welcome from "./components/Welcome";

const Router: React.FunctionComponent = () => {
  return (
    <Fragment>
      <Switch>
        <Route exact path={Routes.ROOT} component={Welcome} />
        <Route exact path={Routes.DASHBOARD} component={Home} />
        <Route exact path={Routes.LOGIN} component={Login} />
        <Route
          exact
          path={Routes.LOGIN_VERIFICATION}
          component={LoginVerification}
        />
      </Switch>
    </Fragment>
  );
};

export default Router;

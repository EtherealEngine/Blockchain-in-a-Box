import React, { Fragment } from "react";
import { Switch, Route } from "react-router-dom";
import Home from "./components/Dashboard";
import Login from "./components/Login";
import LoginVerification from "./components/LoginVerification";
import Routes from "./constants/Routes";
import Welcome from "./components/Welcome";
import SetupSidechain from "./components/SetupSidechain";
import SetupSigningAuthority from "./components/SetupSigningAuthority";

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
        <Route
          exact
          path={[Routes.SETUP, Routes.SETUP_SIDECHAIN]}
          component={SetupSidechain}
        />
        <Route
          exact
          path={Routes.SETUP_SIGNING_AUTHORITY}
          component={SetupSigningAuthority}
        />
      </Switch>
    </Fragment>
  );
};

export default Router;

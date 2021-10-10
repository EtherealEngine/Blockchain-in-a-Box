import React, { Fragment, useEffect } from "react";
import { Switch, Route, useLocation, useHistory } from "react-router-dom";
import DashboardDeployment from "./components/DashboardDeployment";
import Login from "./components/Login";
import LoginVerification from "./components/LoginVerification";
import Routes from "./constants/Routes";
import Welcome from "./components/Welcome";
import SetupSidechain from "./components/SetupSidechain";
import SetupSigningAuthority from "./components/SetupSigningAuthority";
import SetupTreasury from "./components/SetupTreasury";
import SetupMainnet from "./components/SetupMainnet";
import SetupInfura from "./components/SetupInfura";
import SetupPolygon from "./components/SetupPolygon";
import SetupPolygonVigil from "./components/SetupPolygonVigil";
import SetupPinata from "./components/SetupPinata";

import SetupCompleted from "./components/SetupCompleted";
import DashboardContainer from "./components/DashboardContainer";
import DashboardHome from "./components/DashboardHome";
import DashboardUsers from "./components/DashboardUsers";
import DashboardSecurity from "./components/DashboardSecurity";
import DashboardConfigurations from "./components/DashboardConfigurations";
import Timer from "./components/Timer";

import Authenticate from "./components/Authenticate";
import { RootState } from "./redux/Store";
import { useSelector } from "react-redux";

const Router: React.FunctionComponent = () => {
  const location = useLocation();
  const history = useHistory();
  const { accessToken } = useSelector(
    (state: RootState) => state.admin
  );
  const whiteListedRoutes = [
    Routes.LOGIN,
    Routes.LOGIN_VERIFICATION,
    Routes.AUTHENTICATE,
    Routes.ROOT,
  ];

  useEffect(() => {
    if (
      whiteListedRoutes.includes(location.pathname) === false &&
      !accessToken
    ) {
      console.log("User unauthorized");
      //history.push(Routes.LOGIN);
    }
  }, [location.pathname]);

  return (
    <Fragment>
      <Switch>
        <Route exact path={Routes.ROOT} component={Welcome} />
        <Route exact path={Routes.LOGIN} component={Login} />
        <Route exact path={Routes.AUTHENTICATE} component={Authenticate} />
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
        <Route exact path={Routes.SETUP_TREASURE} component={SetupTreasury} />
        <Route exact path={Routes.SETUP_MAINNET} component={SetupMainnet} />
        <Route exact path={Routes.SETUP_INFURA} component={SetupInfura} />
        <Route exact path={Routes.SETUP_POLYGON} component={SetupPolygon} />
        <Route
          exact
          path={Routes.SETUP_POLYGON_VIGIL}
          component={SetupPolygonVigil}
        />
        <Route
          exact
          path={Routes.SETUP_PINATA}
          component={SetupPinata}
        />
        <Route exact path={Routes.SETUP_COMPLETED} component={SetupCompleted} />
        <Route path={Routes.DASHBOARD}>
          <DashboardContainer>
            <Route
              exact
              path={Routes.DASHBOARD_HOME}
              component={DashboardHome}
            />
            <Route
              exact
              path={Routes.DASHBOARD_USERS}
              component={DashboardUsers}
            />
            <Route
              exact
              path={Routes.DASHBOARD_SECURITY}
              component={DashboardSecurity}
            />
            <Route
              exact
              path={Routes.DASHBOARD_CONFIGURATION}
              component={DashboardConfigurations}
            />
            <Route
              exact
              path={Routes.DASHBOARD_DEPLOYMENT}
              component={DashboardDeployment}
            />
             <Route
              exact
              path={Routes.TIMER}
              component={Timer}
            />
          </DashboardContainer>
        </Route>
      </Switch>
    </Fragment>
  );
};

export default Router;

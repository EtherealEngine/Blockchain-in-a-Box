import React, { Fragment, useEffect } from "react";
import { Routes as ReactRoutes, Route, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
      navigate(Routes.LOGIN);
    }
  }, [location.pathname]);

  return (
    <Fragment>
      <ReactRoutes>
        <Route path={Routes.ROOT}  element={<Welcome/>} />
        <Route path={Routes.LOGIN} element={<Login/>} />
        <Route path={Routes.AUTHENTICATE} element={<Authenticate/>} />
        <Route
          path={Routes.LOGIN_VERIFICATION}
          element={<LoginVerification/>}
        />
        <Route
          path={Routes.SETUP_SIDECHAIN}
          element={<SetupSidechain/>}
        />
        <Route
          path={Routes.SETUP_SIGNING_AUTHORITY}
          element={<SetupSigningAuthority/>}
        />
        <Route path={Routes.SETUP_TREASURE} element={<SetupTreasury/>} />
        <Route path={Routes.SETUP_MAINNET} element={<SetupMainnet/>} />
        <Route path={Routes.SETUP_INFURA} element={<SetupInfura/>} />
        <Route path={Routes.SETUP_POLYGON} element={<SetupPolygon/>} />
        <Route
          path={Routes.SETUP_POLYGON_VIGIL}
          element={<SetupPolygonVigil/>}
        />
        <Route
          path={Routes.SETUP_PINATA}
          element={<SetupPinata/>}
        />
        <Route path={Routes.SETUP_COMPLETED} element={<SetupCompleted/>} />
        <Route path={Routes.DASHBOARD} element={<DashboardContainer>
          <ReactRoutes>
            <Route
              path={Routes.DASHBOARD_HOME}
              element={<DashboardHome/>}
            />
            <Route
              path={Routes.DASHBOARD_USERS}
              element={<DashboardUsers/>}
            />
            <Route
              path={Routes.DASHBOARD_SECURITY}
              element={<DashboardSecurity/>}
            />
            <Route
              path={Routes.DASHBOARD_CONFIGURATION}
              element={<DashboardConfigurations/>}
            />
            <Route
              path={Routes.DASHBOARD_DEPLOYMENT}
              element={<DashboardDeployment/>}
            />
             <Route
              path={Routes.TIMER}
              element={<Timer/>}
            />
            </ReactRoutes>
          </DashboardContainer>} />        
      </ReactRoutes>
    </Fragment>
  );
};

export default Router;

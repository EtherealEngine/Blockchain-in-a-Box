import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Grid, makeStyles } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";
import LoadingView from "./LoadingView";
import { RootState } from "../redux/Store";
import Routes from "../constants/Routes";
import {
  checkAdminAuthentication,
  checkFirstTimeLogin,
} from "../redux/slice/AdminReducer";
import ErrorView from "./ErrorView";

const useStyles = makeStyles((theme) => ({
  parentBox: {
    marginTop: "20vh",
    marginBottom: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: 370,
  },
  button: {
    marginTop: theme.spacing(3),
  },
}));

const Authenticate: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loadingMessage, error } = useSelector(
    (state: RootState) => state.admin
  );
  const queryParams = queryString.parse(location.search);

  useEffect(() => {
    const email = queryParams.email ? (queryParams.email as string) : "";
    const token = queryParams.token ? (queryParams.token as string) : "";
    const user = queryParams.user ? (queryParams.user as string) : "";
    const admin = queryParams.admin ? (queryParams.admin as string) : "";
    const landing = queryParams.landing ? (queryParams.landing as string) : "";

    console.log(user, admin, landing);
    localStorage.setItem('email', email)

    if (admin === 'yes') {
      localStorage.setItem('userType', 'admin');
    }
    if (user === 'yes') {
      localStorage.setItem('userType', 'user');
    }
    if (admin === 'yes' && landing !== 'dashboard') {
      history.push(Routes.SETUP)
    } else {
      history.push(Routes.DASHBOARD)
    }


    // dispatch(checkAdminAuthentication([email, token]));
  }, []);

  if (loadingMessage) {
    return <LoadingView loadingText={loadingMessage} />;
  }

  return (
    <Grid container justifyContent="center">
      <Grid className={classes.parentBox} item>
        <ErrorView
          error={error}
          retryMessage="Goto Login"
          onRetry={() => {
            dispatch(checkFirstTimeLogin());
            history.push(Routes.LOGIN);
          }}
        />
      </Grid>
    </Grid>
  );
};

export default Authenticate;

import React, { useEffect } from "react";
import {
  Button,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import Routes from "../constants/Routes";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/Store";
import {
  setError,
  setOrganizationName,
  setSideChainUrl,
} from "../redux/slice/SetupReducer";

const useStyles = makeStyles((theme) => ({
  parentBox: {
    marginTop: "10vh",
    marginBottom: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    maxWidth: 500,
  },
  heading: {
    textAlign: "center",
  },
  subHeading: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  error: {
    marginTop: theme.spacing(3),
  },
  textbox: {
    marginTop: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(3),
  },
  paddedHeading: {
    marginTop: theme.spacing(8),
  },
}));

const SetupSidechain: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();
  const reduxDispatch = useDispatch();
  const { organizationName, sideChainUrl, error } = useSelector(
    (state: RootState) => state.setup
  );

  useEffect(() => {
    reduxDispatch(setError(""));
  }, []);

  return (
    <Grid container justifyContent="center">
      <Grid className={classes.parentBox} item>
        <Typography className={classes.heading} variant="h4">
          Configure Your Sidechain
        </Typography>

        <Typography className={classes.subHeading}>
          Enter a name for the organization that stewards the chain. This won’t
          be displayed to users, this is just to give your dashboards some
          branding.
        </Typography>

        <TextField
          className={classes.textbox}
          variant="outlined"
          label="Organization Name"
          placeholder="Enter organization name"
          value={organizationName}
          onChange={(event) =>
            reduxDispatch(setOrganizationName(event.target.value))
          }
          required
        />

        <Typography
          className={`${classes.subHeading} ${classes.paddedHeading}`}
        >
          You can configure the domains where the REST API can connect to the
          Geth nodes.
        </Typography>

        <TextField
          className={classes.textbox}
          variant="outlined"
          label="Sidechain URL"
          placeholder="Enter sidechain URL"
          value={sideChainUrl}
          onChange={(event) => reduxDispatch(setSideChainUrl(event.target.value))}
          required
        />

        {error && (
          <Typography className={classes.error} variant="body2" color="error">
            {error}
          </Typography>
        )}
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          size="large"
          onClick={() => {
            if (!organizationName) {
              reduxDispatch(setError("Please fill organization name field"));
              return;
            }

            if (!sideChainUrl) {
              reduxDispatch(setError("Please fill sidechain URL field"));
              return;
            }

            reduxDispatch(setError(""));
            history.push(Routes.SETUP_SIGNING_AUTHORITY);
          }}
        >
          Continue
        </Button>
      </Grid>
    </Grid>
  );
};

export default SetupSidechain;

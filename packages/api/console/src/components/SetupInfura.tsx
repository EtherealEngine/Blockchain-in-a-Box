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
import { setError, setInfuraApiKey, setInfuraProjectId } from "../redux/slice/SetupReducer";

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
  },
  error: {
    marginTop: theme.spacing(3),
  },
  button: {
    width: "100%",
  },
  textbox: {
    marginTop: theme.spacing(2),
  },
  marginTop2: {
    marginTop: theme.spacing(2),
  },
  marginTop4: {
    marginTop: theme.spacing(4),
  },
  formLabel: {
    padding: "0 10px",
    background: "white",
  },
}));

const SetupInfura: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();
  const reduxDispatch = useDispatch();
  const { infuraProjectId, infuraApiKey, error } = useSelector(
    (state: RootState) => state.setup
  );

  useEffect(() => {
    reduxDispatch(setError(""));
  }, []);

  return (
    <Grid container justifyContent="center">
      <Grid className={classes.parentBox} item>
        <Typography className={classes.heading} variant="h4">
          Infura API Setup
        </Typography>

        <Typography className={classes.subHeading}>
          The REST API interacts with the mainnet via Infura. You will need an
          API key from infura.io
        </Typography>

        <Typography className={classes.marginTop2}>
          Infura is free to use, but you may with to upgrade if you intend on
          handling a lot of mainnet transactions.
        </Typography>

        <TextField
          className={`${classes.textbox} ${classes.marginTop4}`}
          variant="outlined"
          label="Project ID"
          placeholder="Enter project ID"
          value={infuraProjectId}
          onChange={(event) =>
            reduxDispatch(setInfuraProjectId(event.target.value))
          }
        />

        <TextField
          className={`${classes.textbox} ${classes.marginTop4}`}
          variant="outlined"
          label="API Key"
          placeholder="Enter API key"
          value={infuraApiKey}
          onChange={(event) =>
            reduxDispatch(setInfuraApiKey(event.target.value))
          }
        />

        {error && (
          <Typography className={classes.error} variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Grid className={classes.marginTop4} spacing={4} container>
          <Grid container item xs={6}>
            <Button
              className={classes.button}
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => {
                reduxDispatch(setInfuraProjectId(""));
                reduxDispatch(setInfuraApiKey(""));
                reduxDispatch(setError(""));
                history.push(Routes.SETUP_POLYGON);
              }}
            >
              Skip
            </Button>
          </Grid>
          <Grid container item xs={6}>
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              size="large"
              onClick={() => {
                if (!infuraProjectId) {
                  reduxDispatch(setError("Please fill project ID field"));
                  return;
                }

                if (!infuraApiKey) {
                  reduxDispatch(setError("Please fill API key field"));
                  return;
                }
                
                reduxDispatch(setError(""));
                history.push(Routes.SETUP_POLYGON);
              }}
            >
              Continue
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SetupInfura;

import React, { useEffect, useReducer } from "react";
import {
  Button,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { ActionResult } from "../models/Action";
import { IBasePayload, IStringPayload } from "../models/IPayloads";
import { useHistory } from "react-router-dom";
import Routes from "../constants/Routes";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/Store";
import { setError, setPolygonVigilApiKey } from "../redux/slice/SetupReducer";

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
}));

const SetupPolygonVigil: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();

  const reduxDispatch = useDispatch();
  const { polygonVigilApiKey, error } = useSelector(
    (state: RootState) => state.setup
  );

  useEffect(() => {
    reduxDispatch(setError(""));
  }, []);

  return (
    <Grid container justifyContent="center">
      <Grid className={classes.parentBox} item>
        <Typography className={classes.heading} variant="h4">
          Polygon Vigil Setup
        </Typography>

        <Typography className={classes.subHeading}>
          The REST API interacts with Polygon via MaticVigil. You will need an
          API key from https://rpc.maticvigil.com/
        </Typography>

        <Typography className={classes.marginTop2}>
          MaticVigil is free to use, but you may with to upgrade if you intend
          on handling a lot of mainnet transactions.
        </Typography>

        <TextField
          className={`${classes.textbox} ${classes.marginTop4}`}
          variant="outlined"
          label="API Key"
          placeholder="Enter API key"
          value={polygonVigilApiKey}
          onChange={(event) =>
            reduxDispatch(setPolygonVigilApiKey(event.target.value))
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
                reduxDispatch(setPolygonVigilApiKey(""));
                reduxDispatch(setError(""));
                history.push(Routes.SETUP_COMPLETED);
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
                if (!polygonVigilApiKey) {
                  reduxDispatch(setError("Please fill API key field"));
                  return;
                }

                reduxDispatch(setError(""));
                history.push(Routes.SETUP_COMPLETED);
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

export default SetupPolygonVigil;

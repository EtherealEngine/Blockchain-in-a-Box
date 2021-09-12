import React, { useReducer, useEffect } from "react";
import {
  Button,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { ActionResult } from "../models/Action";
import { IBasePayload, IStringPayload } from "../models/IPayloads";
import { useHistory } from "react-router-dom";
import Routes from "../constants/Routes";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";

import {
  addNotification
} from "../redux/slice/SetupReducer";
import { RootState } from "../redux/Store";

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
  button: {
    marginTop: theme.spacing(3),
  },
  bold: {
    fontWeight: "bold",
  },
  red: {
    color: "#FF0000",
  },
  marginTop2: {
    marginTop: theme.spacing(2),
  },
  marginTop4: {
    marginTop: theme.spacing(4),
  },
  marginTop6: {
    marginTop: theme.spacing(6),
  },
}));

// Local state
interface ILocalState {
  isLoading: boolean;
  error: string;
}

// Local default state
const DefaultLocalState: ILocalState = {
  isLoading: false,
  error: "",
};

// Local actions
const LocalAction = {
  ToggleLoading: "ToggleLoading",
  SetError: "SetError",
};

// Local reducer
const LocalReducer = (
  state: ILocalState,
  action: ActionResult<IBasePayload>
): ILocalState => {
  switch (action.type) {
    case LocalAction.ToggleLoading: {
      return {
        ...state,
        isLoading: !state.isLoading,
      };
    }
    case LocalAction.SetError: {
      return {
        ...state,
        isLoading: false,
        error: (action.payload as IStringPayload).string,
      };
    }
    default: {
      return state;
    }
  }
};

const SetupCompleted: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();
  const reduxDispatch = useDispatch();

  const [
    {
      isLoading,
      error,
    },
    dispatch,
  ] = useReducer(LocalReducer, DefaultLocalState);

  const { result, notifications } = useSelector(
    (state: RootState) => state.setup
  );

  useEffect(() => {
    return () => {
      localStorage.removeItem('setupData')
    }
  }, [])

  useEffect(() => {
    if (notifications) {
      console.log("COMPETE ", result, notifications);
      if (notifications && notifications['Status'] == 200)
        history.push(Routes.DASHBOARD);
    }

  }, [notifications, result])

  const goToDashboard = () => {
    let stateObj = localStorage.getItem('setupData');
    if (stateObj) {
      let stateObjData = JSON.parse(stateObj)

      reduxDispatch(addNotification(stateObjData))
      // history.push(Routes.DASHBOARD);

    }

  }

  return (
    <Grid container justifyContent="center">
      <Grid className={classes.parentBox} item>
        <Typography className={classes.heading} variant="h4">
          Ready To Go!
        </Typography>

        <Typography className={classes.subHeading}>
          You can now go to the control panel, where you can change any of the
          settings above that you set up, as well as get an API key to connect
          your own applications.
        </Typography>

        <Typography className={classes.marginTop2}>
          Please note: out of the box, this API is designed to be accessed from
          your server-side applications, using custodial wallet information that
          your server will need to store.
        </Typography>

        <Typography
          className={`${classes.marginTop4} ${classes.bold} ${classes.red}`}
        >
          If you intend on exposing this API to a client, you should do so
          through your own secure, client-facing server-side gateway.
        </Typography>

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Button
          className={`${classes.button} ${classes.marginTop6}`}
          variant="contained"
          color="primary"
          size="large"
          onClick={() => {
            goToDashboard()
          }}
        >
          Continue
        </Button>
      </Grid>
    </Grid>
  );
};

export default SetupCompleted;

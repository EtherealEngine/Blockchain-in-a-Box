import React, { useReducer } from "react";
import {
  Button,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { ActionResult } from "../models/Action";
import { IBasePayload, IStringPayload } from "../models/IPayloads";
import { useNavigate } from "react-router-dom";
import Routes from "../constants/Routes";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";

import {
  addNotification
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

// Local state
interface ILocalState {
  infuraProjectID: string;
  infuraApiKey: string;
  isLoading: boolean;
  error: string;
}

// Local default state
const DefaultLocalState: ILocalState = {
  infuraProjectID: "",
  infuraApiKey: "",
  isLoading: false,
  error: "",
};

// Local actions
const LocalAction = {
  ToggleLoading: "ToggleLoading",
  SetProjectID: "SetProjectID",
  SetAPIKey: "SetAPIKey",
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
    case LocalAction.SetProjectID: {
      return {
        ...state,
        infuraProjectID: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetAPIKey: {
      return {
        ...state,
        infuraApiKey: (action.payload as IStringPayload).string,
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

const SetupInfura: React.FunctionComponent = () => {
  const reduxDispatch = useDispatch();

  const classes = useStyles();
  const navigate = useNavigate();
  const [{ infuraProjectID, infuraApiKey, isLoading, error }, dispatch] = useReducer(
    LocalReducer,
    DefaultLocalState
  );

  const goToNextPage = () => {
    let stateObj = localStorage.getItem('setupData');
    if (stateObj) {
      let stateObjData = JSON.parse(stateObj)
      let setupObj = { ...stateObjData, infuraProjectID, infuraApiKey };
      localStorage.setItem('setupData', JSON.stringify(setupObj));
      // reduxDispatch(addNotification(setupObj))
      navigate(Routes.SETUP_POLYGON);

    }

  }


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
          value={infuraProjectID}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetProjectID,
              payload: { string: event.target.value },
            })
          }
        />

        <TextField
          className={`${classes.textbox} ${classes.marginTop4}`}
          variant="outlined"
          label="API Key"
          placeholder="Enter API key"
          value={infuraApiKey}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetAPIKey,
              payload: { string: event.target.value },
            })
          }
        />

        {error && (
          <Typography variant="body2" color="error">
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
                navigate(Routes.SETUP_POLYGON);
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
                goToNextPage()
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

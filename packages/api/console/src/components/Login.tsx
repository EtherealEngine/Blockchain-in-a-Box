import React, { useEffect, useReducer } from "react";
import { useHistory } from "react-router-dom";
import {
  TextField,
  Grid,
  Button,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { ActionResult } from "../models/Action";
import { IBasePayload, IStringPayload } from "../models/IPayloads";
import LoadingView from "./LoadingView";
import {
  checkAdminLogin,
  checkFirstTimeLogin,
} from "../redux/slice/AdminReducer";
import { RootState } from "../redux/Store";
import { LoggedInState } from "../models/Admin";
import { validateEmail } from "../utilities/Utility";

const useStyles = makeStyles((theme) => ({
  parentBox: {
    marginTop: "20vh",
    marginBottom: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: 370,
  },
  heading: {
    textAlign: "center",
  },
  subHeading: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  textbox: {
    marginTop: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(3),
  },
}));

// Local state
interface ILocalState {
  email: string;
  localError: string;
}

// Local default state
const DefaultLocalState: ILocalState = {
  email: "",
  localError: "",
};

// Local actions
const LocalAction = {
  SetEmail: "SetEmail",
  SetError: "SetError",
};

// Local reducer
const LocalReducer = (
  state: ILocalState,
  action: ActionResult<IBasePayload>
): ILocalState => {
  switch (action.type) {
    case LocalAction.SetEmail: {
      return {
        ...state,
        email: (action.payload as IStringPayload).string,
        localError: "",
      };
    }
    case LocalAction.SetError: {
      return {
        ...state,
        localError: (action.payload as IStringPayload).string,
      };
    }
    default: {
      return state;
    }
  }
};

const Login: React.FunctionComponent = () => {
  const classes = useStyles();
  const reduxDispatch = useDispatch();
  const { loadingMessage, loginState, error } = useSelector(
    (state: RootState) => state.admin
  );
  const [{ email, localError }, dispatch] = useReducer(
    LocalReducer,
    DefaultLocalState
  );

  useEffect(() => {
    reduxDispatch(checkFirstTimeLogin());
  }, []);

  if (loadingMessage) {
    return <LoadingView loadingText={loadingMessage} />;
  }

  return (
    <Grid container justifyContent="center">
      <Grid className={classes.parentBox} item>
        <Typography className={classes.heading} variant="h4">
          {loginState === LoggedInState.Recurring
            ? "Login"
            : "Deployment Successful!"}
        </Typography>
        <Typography className={classes.subHeading}>
          {loginState === LoggedInState.Recurring
            ? "If you are an administrator, you can log in to change API settings."
            : "You’ll need to finalize setup before the chain is ready to use. First, set up an administrator email address."}
        </Typography>

        <TextField
          className={classes.textbox}
          error={Boolean(error)}
          variant="outlined"
          label="Administrator Email address"
          placeholder="Enter email address"
          value={email}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetEmail,
              payload: { string: event.target.value },
            })
          }
          required
        />

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        {localError && (
          <Typography variant="body2" color="error">
            {localError}
          </Typography>
        )}

        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          size="large"
          onClick={() => {
            if (validateEmail(email) === false) {
              dispatch({
                type: LocalAction.SetError,
                payload: {
                  string: "Please enter a valid email",
                },
              });
              return;
            }

            reduxDispatch(checkAdminLogin(email));
          }}
        >
          {loginState === LoggedInState.Recurring
            ? "Login"
            : "Register Account"}
        </Button>
      </Grid>
    </Grid>
  );
};

export default Login;

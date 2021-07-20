import React, { useEffect, useReducer } from "react";
import { useHistory } from "react-router-dom";
import {
  TextField,
  Grid,
  Button,
  makeStyles,
  Typography,
} from "@material-ui/core";
import axios from "axios";
import { ActionResult } from "../models/Action";
import { IBasePayload, IStringPayload } from "../models/IPayloads";
import { timeout } from "../utilities/Utility";
import Routes from "../constants/Routes";

const useStyles = makeStyles((theme) => ({
  parentBox: {
    marginTop: "20vh",
    marginBottom: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: 350,
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

export interface ILoggedInStatePayload extends IBasePayload {
  key?: string;
  status: LoggedInState;
}

export enum LoggedInState {
  None,
  FirstTime,
  Recurring,
}

// Local state
interface ILocalState {
  email: string;
  isLoading: boolean;
  error: string;
  status: LoggedInState;
}

// Local default state
const DefaultLocalState: ILocalState = {
  email: "",
  isLoading: false,
  error: "",
  status: LoggedInState.None,
};

// Local actions
const LocalAction = {
  ToggleLoading: "ToggleLoading",
  SetEmail: "SetEmail",
  SetStatus: "SetStatus",
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
    case LocalAction.SetEmail: {
      return {
        ...state,
        email: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetStatus: {
      return {
        ...state,
        isLoading: false,
        status: (action.payload as ILoggedInStatePayload).status,
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

const Login: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();
  const [{ email, isLoading, error, status }, dispatch] = useReducer(
    LocalReducer,
    DefaultLocalState
  );

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    dispatch({ type: LocalAction.ToggleLoading });

    await timeout(2000);

    dispatch({
      type: LocalAction.SetStatus,
      payload: {
        status: LoggedInState.Recurring,
      },
    });
  };

  // const loginUser = async (e: any) => {
  //   e.preventDefault();
  //   if (email === "") {
  //     dispatch({ type: LocalAction.ShowNullError });
  //   } else {
  //     try {
  //       //TODO: This needs to be in API folder.
  //       const response = await axios.post("http://localhost:3003/loginUser", {
  //         email,
  //       });
  //       localStorage.setItem("JWT", response.data.token);
  //       dispatch({ type: LocalAction.SetLoggedIn });
  //     } catch (error) {
  //       console.error(error.response.data);
  //       if (
  //         error.response.data === "bad username" ||
  //         error.response.data === "passwords do not match"
  //       ) {
  //         dispatch({ type: LocalAction.ShowError });
  //       }
  //     }
  //   }
  // };

  return (
    <Grid container justifyContent="center">
      <Grid className={classes.parentBox} item>
        <Typography className={classes.heading} variant="h4">
          Login
        </Typography>
        <Typography className={classes.subHeading}>
          If you are an administrator, you can log in to change API settings.
        </Typography>

        <TextField
          className={classes.textbox}
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
        />

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          size="large"
          onClick={() => {
            //TODO: Perform email validation.
            if (status === LoggedInState.FirstTime) {
              history.push(Routes.SETUP);
            } else {
              history.push(Routes.DASHBOARD);
            }
          }}
        >
          Login
        </Button>
      </Grid>
    </Grid>
  );
};

export default Login;

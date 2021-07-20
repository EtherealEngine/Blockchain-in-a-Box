import React, { useReducer } from "react";
import { Redirect, useHistory } from "react-router-dom";
import {
  TextField,
  Grid,
  Button,
  makeStyles,
  Typography,
  Box,
} from "@material-ui/core";
import axios from "axios";
import { ActionResult } from "../models/Action";
import { IBasePayload, IStringPayload } from "../models/IPayloads";
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

// Local state
interface ILocalState {
  username: string;
  password: string;
  loggedIn: boolean;
  showError: boolean;
  showNullError: boolean;
}

// Local default state
const DefaultLocalState: ILocalState = {
  username: "",
  password: "",
  loggedIn: false,
  showError: false,
  showNullError: false,
};

// Local actions
const LocalAction = {
  SetUsername: "SetUsername",
  SetPassword: "SetPassword",
  ShowNullError: "ShowNullError",
  SetLoggedIn: "SetLoggedIn",
  ShowError: "ShowError",
};

// Local reducer
const LocalReducer = (
  state: ILocalState,
  action: ActionResult<IBasePayload>
): ILocalState => {
  switch (action.type) {
    case LocalAction.SetUsername: {
      return {
        ...state,
        username: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetPassword: {
      return {
        ...state,
        password: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetLoggedIn: {
      return {
        ...state,
        loggedIn: true,
        showError: false,
        showNullError: false,
      };
    }
    case LocalAction.ShowNullError: {
      return {
        ...state,
        showError: false,
        showNullError: true,
        loggedIn: false,
      };
    }
    case LocalAction.ShowError: {
      return {
        ...state,
        showError: true,
        showNullError: false,
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
  const [{ username, password, showError, loggedIn, showNullError }, dispatch] =
    useReducer(LocalReducer, DefaultLocalState);

  const loginUser = async (e: any) => {
    e.preventDefault();
    if (username === "" || password === "") {
      dispatch({ type: LocalAction.ShowNullError });
    } else {
      try {
        //TODO: This needs to be in API folder.
        const response = await axios.post("http://localhost:3003/loginUser", {
          username,
          password,
        });
        localStorage.setItem("JWT", response.data.token);
        dispatch({ type: LocalAction.SetLoggedIn });
      } catch (error) {
        console.error(error.response.data);
        if (
          error.response.data === "bad username" ||
          error.response.data === "passwords do not match"
        ) {
          dispatch({ type: LocalAction.ShowError });
        }
      }
    }
  };

  if (!loggedIn) {
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
            label="Username"
            placeholder="Enter username"
            value={username}
            onChange={(event) =>
              dispatch({
                type: LocalAction.SetUsername,
                payload: { string: event.target.value },
              })
            }
          />
          <TextField
            className={classes.textbox}
            variant="outlined"
            label="Password"
            placeholder="Enter password"
            value={password}
            onChange={(event) =>
              dispatch({
                type: LocalAction.SetPassword,
                payload: { string: event.target.value },
              })
            }
            type="password"
          />

          {showNullError && (
            <div>
              <p>The username or password cannot be null.</p>
            </div>
          )}
          {showError && (
            <div>
              <p>
                That username or password isn&apos;t recognized. Please try
                again or register now.
              </p>
              <Button onClick={() => history.push(Routes.REGISTER)}>
                Register
              </Button>
            </div>
          )}
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            size="large"
            onClick={loginUser}
          >
            Login
          </Button>
          <Button
            className={classes.button}
            onClick={() => history.push(Routes.FORGOT_PASSWORD)}
          >
            Forgot Password?
          </Button>
        </Grid>
      </Grid>
    );
  }

  return <Redirect to={`/userProfile/${username}`} />;
};

export default Login;

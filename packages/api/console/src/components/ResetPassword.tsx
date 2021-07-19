import React, { useEffect, useReducer } from "react";
import axios from "axios";
import TextField from "@material-ui/core/TextField";
import { ActionResult } from "../models/Action";
import {
  IBasePayload,
  IStringPayload,
} from "../models/IPayloads";
import { useHistory, useParams } from "react-router-dom";
import { Button } from "@material-ui/core";
import Routes from "../constants/Routes";

const loading = {
  margin: "1em",
  fontSize: "24px",
};

// Local state
interface ILocalState {
  username: string;
  password: string;
  updated: boolean;
  isLoading: boolean;
  error: boolean;
}

// Local default state
const DefaultLocalState: ILocalState = {
  username: "",
  password: "",
  updated: false,
  isLoading: true,
  error: false,
};

// Local actions
const LocalAction = {
  SetCredentials: "SetCredentials",
  SetPassword: "SetPassword",
  SetPasswordUpdated: "SetPasswordUpdated",
  SetPasswordFailed: "SetPasswordFailed",
  ShowError: "ShowError",
  SetLoading: "SetLoading",
};

// Local reducer
const LocalReducer = (
  state: ILocalState,
  action: ActionResult<IBasePayload>
): ILocalState => {
  switch (action.type) {
    case LocalAction.SetCredentials: {
      return {
        ...state,
        username: (action.payload as IStringPayload).string,
        updated: false,
        isLoading: false,
        error: false,
      };
    }
    case LocalAction.SetPassword: {
      return {
        ...state,
        password: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetPasswordUpdated: {
      return {
        ...state,
        updated: true,
        error: false,
      };
    }
    case LocalAction.SetPasswordFailed: {
      return {
        ...state,
        updated: false,
        error: true,
      };
    }
    case LocalAction.ShowError: {
      return {
        ...state,
        updated: false,
        isLoading: false,
        error: true,
      };
    }
    case LocalAction.SetLoading: {
      return {
        ...state,
        isLoading: true,
      };
    }
    default: {
      return state;
    }
  }
};

const ResetPassword: React.FunctionComponent = () => {
  const history = useHistory();
  const routeParams = useParams<{ token: string }>();
  const [{ username, password, isLoading, updated, error }, dispatch] =
    useReducer(LocalReducer, DefaultLocalState);

  useEffect(() => {
    processInit();
  }, []);

  const processInit = async () => {
    dispatch({ type: LocalAction.SetLoading });
    try {
      const response = await axios.get("http://localhost:3003/reset", {
        params: {
          resetPasswordToken: routeParams.token,
        },
      });
      // console.log(response);
      if (response.data.message === "password reset link a-ok") {
        dispatch({
          type: LocalAction.SetCredentials,
          payload: {
            string: response.data.username,
          },
        });
      }
    } catch (error) {
      console.log(error.response.data);
      dispatch({ type: LocalAction.ShowError });
    }
  };

  const updatePassword = async (e: any) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:3003/updatePasswordViaEmail",
        {
          username,
          password,
          resetPasswordToken: routeParams.token,
        }
      );
      console.log(response.data);
      if (response.data.message === "password updated") {
        dispatch({ type: LocalAction.SetPasswordUpdated });
      } else {
        dispatch({ type: LocalAction.SetPasswordFailed });
      }
    } catch (error) {
      console.log(error.response.data);
    }
  };

  if (error) {
    return (
      <div>
        <div style={loading}>
          <h4>Problem resetting password. Please send another reset link.</h4>
          <Button onClick={() => history.push(Routes.HOME)}>Go Home</Button>
          <Button onClick={() => history.push(Routes.FORGOT_PASSWORD)}>
            Forgot Password?
          </Button>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div>
        <div style={loading}>Loading User Data...</div>
      </div>
    );
  }
  return (
    <div>
      <form className="password-form" onSubmit={updatePassword}>
        <TextField
          id="password"
          label="password"
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetPassword,
              payload: { string: event.target.value },
            })
          }
          value={password}
          type="password"
        />
        <Button onClick={() => history.push(Routes.UPDATE_PASSWORD)}>
          Update Password
        </Button>
      </form>

      {updated && (
        <div>
          <p>
            Your password has been successfully reset, please try logging in
            again.
          </p>
          <Button onClick={() => history.push(Routes.LOGIN)}>Login</Button>
        </div>
      )}
      <Button onClick={() => history.push(Routes.HOME)}>Go Home</Button>
    </div>
  );
};

export default ResetPassword;

import React, { useEffect, useReducer } from "react";
import { Redirect, useHistory, useParams } from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import axios from "axios";
import { ActionResult } from "../models/Action";
import {
  IBasePayload,
  IStringPayload,
  IStringsPayload,
} from "../models/IPayloads";
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
  loadingUser: boolean;
  updated: boolean;
  error: boolean;
}

// Local default state
const DefaultLocalState: ILocalState = {
  username: "",
  password: "",
  loadingUser: false,
  updated: false,
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
        loadingUser: false,
        username: (action.payload as IStringsPayload).strings[0],
        password: (action.payload as IStringsPayload).strings[1],
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
        loadingUser: false,
      };
    }
    case LocalAction.SetPasswordFailed: {
      return {
        ...state,
        updated: false,
        error: true,
        loadingUser: false,
      };
    }
    case LocalAction.ShowError: {
      return {
        ...state,
        loadingUser: false,
        error: true,
      };
    }
    case LocalAction.SetLoading: {
      return {
        ...state,
        loadingUser: true,
      };
    }
    default: {
      return state;
    }
  }
};

const UpdatePassword: React.FunctionComponent = () => {
  const history = useHistory();
  const routeParams = useParams<{ username: string }>();
  const [{ username, password, loadingUser, updated, error }, dispatch] =
    useReducer(LocalReducer, DefaultLocalState);

  useEffect(() => {
    processInit();
  }, []);

  const processInit = async () => {
    dispatch({ type: LocalAction.SetLoading });

    const accessString = localStorage.getItem("JWT");
    if (accessString === null) {
      dispatch({ type: LocalAction.ShowError });
    } else {
      try {
        const response = await axios.get("http://localhost:3003/findUser", {
          params: {
            username: routeParams.username,
          },
          headers: { Authorization: `JWT ${accessString}` },
        });
        dispatch({
          type: LocalAction.SetCredentials,
          payload: {
            strings: [response.data.username, response.data.password],
          },
        });
      } catch (error) {
        console.log(error.response.data);
        dispatch({ type: LocalAction.ShowError });
      }
    }
  };

  const updatePassword = async (e: any) => {
    const accessString = localStorage.getItem("JWT");
    if (accessString === null) {
      dispatch({ type: LocalAction.ShowError });
    } else {
      e.preventDefault();
      try {
        const response = await axios.put(
          "http://localhost:3003/updatePassword",
          {
            username,
            password,
          },
          {
            headers: { Authorization: `JWT ${accessString}` },
          }
        );
        if (response.data.message === "password updated") {
          dispatch({ type: LocalAction.SetPasswordUpdated });
        }
      } catch (error) {
        console.log(error.response.data);
        dispatch({ type: LocalAction.SetPasswordFailed });
      }
    }
  };

  if (error) {
    return (
      <div>
        <p style={loading}>
          There was a problem accessing your data. Please go login again.
        </p>
        <Button onClick={() => history.push(Routes.LOGIN)}>Go Login</Button>
      </div>
    );
  }
  if (loadingUser !== false) {
    return (
      <div>
        <p style={loading}>Loading user data...</p>
      </div>
    );
  }
  if (loadingUser === false && updated === true) {
    return <Redirect to={`/userProfile/${username}`} />;
  }

  return (
    <div>
      <form className="profile-form" onSubmit={updatePassword}>
        <TextField
          id="password"
          label="password"
          value={password}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetPassword,
              payload: { string: event.target.value },
            })
          }
          type="password"
        />
        <Button>Save Changes</Button>
      </form>
      <Button onClick={() => history.push(Routes.HOME)}>Go Home</Button>
      <Button onClick={() => history.push(`/userProfile/${username}`)}>
        Cancel Changes
      </Button>
    </div>
  );
};

export default UpdatePassword;

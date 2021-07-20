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
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  loadingUser: boolean;
  updated: boolean;
  error: boolean;
}

// Local default state
const DefaultLocalState: ILocalState = {
  firstname: "",
  lastname: "",
  email: "",
  username: "",
  password: "",
  loadingUser: false,
  updated: false,
  error: false,
};

// Local actions
const LocalAction = {
  SetDetails: "SetDetails",
  SetFirstname: "SetFirstname",
  SetLastname: "SetLastname",
  SetEmail: "SetEmail",
  SetDetailsUpdated: "SetDetailsUpdated",
  SetDetailsFailed: "SetDetailsFailed",
  ShowError: "ShowError",
  SetLoading: "SetLoading",
};

// Local reducer
const LocalReducer = (
  state: ILocalState,
  action: ActionResult<IBasePayload>
): ILocalState => {
  switch (action.type) {
    case LocalAction.SetDetails: {
      return {
        ...state,
        loadingUser: false,
        firstname: (action.payload as IStringsPayload).strings[0],
        lastname: (action.payload as IStringsPayload).strings[1],
        email: (action.payload as IStringsPayload).strings[2],
        username: (action.payload as IStringsPayload).strings[3],
        password: (action.payload as IStringsPayload).strings[4],
        error: false,
      };
    }
    case LocalAction.SetFirstname: {
      return {
        ...state,
        firstname: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetLastname: {
      return {
        ...state,
        lastname: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetEmail: {
      return {
        ...state,
        email: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetDetailsUpdated: {
      return {
        ...state,
        updated: true,
        error: false,
        loadingUser: false,
      };
    }
    case LocalAction.SetDetailsFailed: {
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

const UpdateProfile: React.FunctionComponent = () => {
  const history = useHistory();
  const routeParams = useParams<{ username: string }>();
  const [
    {
      firstname,
      lastname,
      email,
      username,
      password,
      loadingUser,
      updated,
      error,
    },
    dispatch,
  ] = useReducer(LocalReducer, DefaultLocalState);

  useEffect(() => {
    processInit();
  }, []);

  const processInit = async () => {
    dispatch({ type: LocalAction.SetLoading });

    const accessString = localStorage.getItem("JWT");
    if (accessString === null) {
      dispatch({ type: LocalAction.ShowError });
    }
    try {
      const response = await axios.get("http://localhost:3003/findUser", {
        params: {
          username: routeParams.username,
        },
        headers: { Authorization: `JWT ${accessString}` },
      });
      console.log(response.data);
      dispatch({
        type: LocalAction.SetDetails,
        payload: {
          strings: [
            response.data.first_name ? response.data.first_name : "",
            response.data.last_name ? response.data.last_name : "",
            response.data.email,
            response.data.username,
            response.data.password,
          ],
        },
      });
    } catch (error) {
      console.log(error.response.data);
      dispatch({ type: LocalAction.ShowError });
    }
  };

  const updateUser = async (e: any) => {
    const accessString = localStorage.getItem("JWT");
    if (accessString === null) {
      dispatch({ type: LocalAction.ShowError });
    }
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:3003/updateUser",
        {
          first_name: firstname,
          last_name: lastname,
          email,
          username,
        },
        {
          headers: { Authorization: `JWT ${accessString}` },
        }
      );
      console.log(response.data);
      dispatch({ type: LocalAction.SetDetailsUpdated });
    } catch (error) {
      console.log(error.response.data);
      dispatch({ type: LocalAction.SetDetailsFailed });
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
      <form className="profile-form" onSubmit={updateUser}>
        <TextField
          id="first_name"
          label="first_name"
          value={firstname}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetFirstname,
              payload: { string: event.target.value },
            })
          }
          placeholder="First Name"
        />
        <TextField
          id="last_name"
          label="last_name"
          value={lastname}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetLastname,
              payload: { string: event.target.value },
            })
          }
          placeholder="Last Name"
        />
        <TextField
          id="email"
          label="email"
          value={email}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetEmail,
              payload: { string: event.target.value },
            })
          }
          placeholder="Email"
        />
        <TextField id="username" label="username" value={username} disabled />
        <TextField
          id="password"
          label="password"
          value={password}
          type="password"
          disabled
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

export default UpdateProfile;

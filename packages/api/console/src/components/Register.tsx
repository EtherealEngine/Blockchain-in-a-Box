import React, { useReducer } from "react";
import TextField from "@material-ui/core/TextField";
import axios from "axios";
import { ActionResult } from "../models/Action";
import { IBasePayload, IStringPayload } from "../models/IPayloads";
import { useHistory, useParams } from "react-router-dom";
import { Button } from "@material-ui/core";
import Routes from "../constants/Routes";

// Local state
interface ILocalState {
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  messageFromServer: string;
  showError: boolean;
  registerError: boolean;
  loginError: boolean;
}

// Local default state
const DefaultLocalState: ILocalState = {
  firstname: "",
  lastname: "",
  email: "",
  username: "",
  password: "",
  messageFromServer: "",
  showError: false,
  registerError: false,
  loginError: false,
};

// Local actions
const LocalAction = {
  SetFirstname: "SetFirstname",
  SetLastname: "SetLastname",
  SetEmail: "SetEmail",
  SetUsername: "SetUsername",
  SetPassword: "SetPassword",
  SetMessageFromServer: "SetMessageFromServer",
  SetRegisterError: "SetRegisterError",
  SetLoginError: "SetLoginError",
};

// Local reducer
const LocalReducer = (
  state: ILocalState,
  action: ActionResult<IBasePayload>
): ILocalState => {
  switch (action.type) {
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
    case LocalAction.SetMessageFromServer: {
      return {
        ...state,
        messageFromServer: (action.payload as IStringPayload).string,
        showError: false,
        loginError: false,
        registerError: false,
      };
    }
    case LocalAction.SetRegisterError: {
      return {
        ...state,
        showError: true,
        loginError: false,
        registerError: true,
      };
    }
    case LocalAction.SetLoginError: {
      return {
        ...state,
        showError: true,
        loginError: true,
        registerError: false,
      };
    }
    default: {
      return state;
    }
  }
};

const Register: React.FunctionComponent = () => {
  const history = useHistory();
  const routeParams = useParams<{ username: string }>();
  const [
    {
      firstname,
      lastname,
      email,
      username,
      password,
      messageFromServer,
      showError,
      registerError,
      loginError,
    },
    dispatch,
  ] = useReducer(LocalReducer, DefaultLocalState);

  const registerUser = async (e: any) => {
    e.preventDefault();
    if (username === "" || password === "" || email === "") {
      dispatch({ type: LocalAction.SetRegisterError });
    } else {
      try {
        const response = await axios.post(
          "http://localhost:3003/registerUser",
          {
            firstname,
            lastname,
            email,
            username,
            password,
          }
        );
        dispatch({
          type: LocalAction.SetMessageFromServer,
          payload: {
            string: response.data.message,
          },
        });
      } catch (error) {
        console.error(error.response.data);
        if (error.response.data === "username or email already taken") {
          dispatch({ type: LocalAction.SetLoginError });
        }
      }
    }
  };

  if (messageFromServer === "user created") {
    return (
      <div>
        <h3>User successfully registered!</h3>
        <Button onClick={() => history.push(Routes.LOGIN)}>Go Login</Button>
      </div>
    );
  }

  return (
    <div>
      <form className="profile-form" onSubmit={registerUser}>
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
        <TextField
          id="username"
          label="username"
          value={username}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetUsername,
              payload: { string: event.target.value },
            })
          }
          placeholder="Username"
        />
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
          placeholder="Password"
          type="password"
        />
        <Button>Register</Button>
      </form>
      {showError === true && registerError === true && (
        <div>
          <p>Username, password and email are required fields.</p>
        </div>
      )}
      {showError === true && loginError === true && (
        <div>
          <p>
            That username or email is already taken. Please choose another or
            login.
          </p>
          <Button onClick={() => history.push(Routes.LOGIN)}>Login</Button>
        </div>
      )}
      <Button onClick={() => history.push(Routes.HOME)}>Go Home</Button>
    </div>
  );
};

export default Register;

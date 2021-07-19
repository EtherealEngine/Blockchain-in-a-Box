/* eslint-disable no-console */
import React, { useReducer } from "react";
import axios from "axios";
import { ActionResult } from "../models/Action";
import {
  IBasePayload,
  IStringPayload,
} from "../models/IPayloads";
import { Button, TextField } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import Routes from "../constants/Routes";

// Local state
interface ILocalState {
  email: string;
  showError: boolean;
  messageFromServer: string;
  showNullError: boolean;
}

// Local default state
const DefaultLocalState: ILocalState = {
  email: "",
  showError: false,
  messageFromServer: "",
  showNullError: false,
};

// Local actions
const LocalAction = {
  SetEmail: "SetEmail",
  ShowNullError: "ShowNullError",
  SetMessageFromServer: "SetMessageFromServer",
  ShowError: "ShowError",
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
      };
    }
    case LocalAction.ShowNullError: {
      return {
        ...state,
        showError: false,
        messageFromServer: "",
        showNullError: true,
      };
    }
    case LocalAction.SetMessageFromServer: {
      return {
        ...state,
        showError: false,
        messageFromServer: (action.payload as IStringPayload).string,
        showNullError: true,
      };
    }
    case LocalAction.ShowError: {
      return {
        ...state,
        showError: true,
        messageFromServer: "",
        showNullError: false,
      };
    }
    default: {
      return state;
    }
  }
};

const ForgotPassword: React.FunctionComponent = () => {
  const history = useHistory();
  const [{ email, messageFromServer, showNullError, showError }, dispatch] =
    useReducer(LocalReducer, DefaultLocalState);

  const sendEmail = async (e: any) => {
    e.preventDefault();
    if (email === "") {
      dispatch({ type: LocalAction.ShowNullError });
    } else {
      try {
        //TODO: This needs to be in API folder.
        const response = await axios.post(
          "http://localhost:3003/forgotPassword",
          {
            email,
          }
        );
        console.log(response.data);
        if (response.data === "recovery email sent") {
          dispatch({
            type: LocalAction.SetMessageFromServer,
            payload: { string: "recovery email sent" },
          });
        }
      } catch (error) {
        console.error(error.response.data);
        if (error.response.data === "email not in db") {
          dispatch({ type: LocalAction.ShowError });
        }
      }
    }
  };

  return (
    <div>
      <form className="profile-form" onSubmit={sendEmail}>
        <TextField
          id="email"
          label="email"
          value={email}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetMessageFromServer,
              payload: { string: event.target.value },
            })
          }
          placeholder="Email Address"
        />
        <Button>Send Password Reset Email</Button>
      </form>
      {showNullError && (
        <div>
          <p>The email address cannot be null.</p>
        </div>
      )}
      {showError && (
        <div>
          <p>
            That email address isn&apos;t recognized. Please try again or
            register for a new account.
          </p>
          <Button onClick={() => history.push(Routes.REGISTER)}>Register</Button>
        </div>
      )}
      {messageFromServer === "recovery email sent" && (
        <div>
          <h3>Password Reset Email Successfully Sent!</h3>
        </div>
      )}
      <Button onClick={() => history.push(Routes.HOME)}>Go Home</Button>
    </div>
  );
};

export default ForgotPassword;

import React, { useEffect, useReducer } from "react";
import axios from "axios";
import Table from "@material-ui/core/Table";
import Button from "@material-ui/core/Button";
import { Link, Redirect, useHistory, useParams } from "react-router-dom";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { ActionResult } from "../models/Action";
import { IBasePayload, IStringsPayload } from "../models/IPayloads";
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
  isLoading: boolean;
  error: boolean;
  deleted: boolean;
}

// Local default state
const DefaultLocalState: ILocalState = {
  firstname: "",
  lastname: "",
  email: "",
  username: "",
  password: "",
  isLoading: false,
  error: false,
  deleted: false,
};

// Local actions
const LocalAction = {
  SetDetails: "SetDetails",
  ShowError: "ShowError",
  SetLoading: "SetLoading",
  SetDeleted: "SetDeleted",
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
        isLoading: false,
        firstname: (action.payload as IStringsPayload).strings[0],
        lastname: (action.payload as IStringsPayload).strings[1],
        email: (action.payload as IStringsPayload).strings[2],
        username: (action.payload as IStringsPayload).strings[3],
        password: (action.payload as IStringsPayload).strings[4],
        error: false,
      };
    }
    case LocalAction.ShowError: {
      return {
        ...state,
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
    case LocalAction.SetDeleted: {
      return {
        ...state,
        deleted: true,
      };
    }
    default: {
      return state;
    }
  }
};

const Profile: React.FunctionComponent = () => {
  const history = useHistory();
  const routeParams = useParams<{ username: string }>();
  const [
    {
      firstname,
      lastname,
      email,
      username,
      password,
      isLoading,
      error,
      deleted,
    },
    dispatch,
  ] = useReducer(LocalReducer, DefaultLocalState);

  useEffect(() => {
    processInit();
  }, []);

  const processInit = async () => {
    dispatch({ type: LocalAction.SetLoading });

    const accessString = localStorage.getItem("JWT");
    if (accessString == null) {
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
          type: LocalAction.SetDetails,
          payload: {
            strings: [
              response.data.first_name,
              response.data.last_name,
              response.data.email,
              response.data.username,
              response.data.password,
            ],
          },
        });
      } catch (error) {
        console.error(error.response.data);
        dispatch({ type: LocalAction.ShowError });
      }
    }
  };

  const deleteUser = async (e: any) => {
    const accessString = localStorage.getItem("JWT");
    if (accessString === null) {
      dispatch({ type: LocalAction.ShowError });
    }

    e.preventDefault();
    try {
      const response = await axios.delete("http://localhost:3003/deleteUser", {
        params: {
          username: routeParams.username,
        },
        headers: { Authorization: `JWT ${accessString}` },
      });
      console.log(response.data);
      localStorage.removeItem("JWT");
      dispatch({ type: LocalAction.SetDeleted });
    } catch (error) {
      console.error(error.response.data);
      dispatch({ type: LocalAction.ShowError });
    }
  };

  const logout = (e: any) => {
    e.preventDefault();
    localStorage.removeItem("JWT");
  };

  if (error) {
    return (
      <div>
        <div style={loading}>
          Problem fetching user data. Please login again.
        </div>
        <Button onClick={() => history.push(Routes.LOGIN)}>Login</Button>
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
  if (deleted) {
    return <Redirect to="/" />;
  }
  return (
    <div>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>First Name</TableCell>
            <TableCell>{firstname}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Name</TableCell>
            <TableCell>{lastname}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>{email}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>User Name</TableCell>
            <TableCell>{username}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Password</TableCell>
            <TableCell style={{ WebkitTextSecurity: "disc" }}>
              {password}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button onClick={deleteUser}>Delete User</Button>
      <Button onClick={() => history.push(`/updateUser/${username}`)}>
        Update User
      </Button>
      <Button onClick={() => history.push(`/updatePassword/${username}`)}>
        Update Password
      </Button>
      <Button onClick={logout}>
        <Link to={Routes.HOME}>Logout</Link>
      </Button>
    </div>
  );
};

export default Profile;

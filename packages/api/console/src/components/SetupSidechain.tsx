import React, { useReducer, useEffect } from "react";
import {
  Button,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { ActionResult } from "../models/Action";
import { IBasePayload, IStringPayload } from "../models/IPayloads";
import { useHistory } from "react-router-dom";
import Routes from "../constants/Routes";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/Store";


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
    marginBottom: theme.spacing(2),
  },
  textbox: {
    marginTop: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(3),
  },
  paddedHeading: {
    marginTop: theme.spacing(8),
  }
}));

// Local state
interface ILocalState {
  organizationName: string;
  sidechainURL: string;
  isLoading: boolean;
  error: string;
}

// Local default state
const DefaultLocalState: ILocalState = {
  organizationName: "",
  sidechainURL: "",
  isLoading: false,
  error: "",
};

// Local actions
const LocalAction = {
  ToggleLoading: "ToggleLoading",
  SetOrganizationName: "SetOrganizationName",
  SetSidechainURL: "SetSidechainURL",
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
    case LocalAction.SetOrganizationName: {
      return {
        ...state,
        organizationName: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetSidechainURL: {
      return {
        ...state,
        sidechainURL: (action.payload as IStringPayload).string,
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

const SetupSidechain: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();

  const { email } = useSelector(
    (state: RootState) => state.admin
  );

  const [{ organizationName, sidechainURL, isLoading, error }, dispatch] = useReducer(
    LocalReducer,
    DefaultLocalState
  );


  const goToNextPage = () => {
    let setupObj = { organizationName, sidechainURL, email };
    console.log("TST ", email);
    localStorage.setItem('setupData', JSON.stringify(setupObj));
    history.push(Routes.SETUP_SIGNING_AUTHORITY);
  }

  return (
    <Grid container justifyContent="center">
      <Grid className={classes.parentBox} item>
        <Typography className={classes.heading} variant="h4">
          Configure Your Sidechain
        </Typography>

        <Typography className={classes.subHeading}>
          Enter a name for the organization that stewards the chain. This won’t
          be displayed to users, this is just to give your dashboards some
          branding.
        </Typography>

        <TextField
          className={classes.textbox}
          variant="outlined"
          label="Organization Name"
          placeholder="Enter organization name"
          value={organizationName}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetOrganizationName,
              payload: { string: event.target.value },
            })
          }
          required
        />

        <Typography className={`${classes.subHeading} ${classes.paddedHeading}`}>
          You can configure the domains where the REST API can connect to the Geth nodes.
        </Typography>

        <TextField
          className={classes.textbox}
          variant="outlined"
          label="Sidechain URL"
          placeholder="Enter sidechain URL"
          value={sidechainURL}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetSidechainURL,
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
  );
};

export default SetupSidechain;

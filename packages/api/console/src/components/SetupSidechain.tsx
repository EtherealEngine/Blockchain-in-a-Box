import React, { useReducer } from "react";
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
import { useDispatch } from "react-redux";
import { configureSidechain } from "../redux/slice/SetupReducer";

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
  error: {
    marginTop: theme.spacing(3),
  },
  textbox: {
    marginTop: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(3),
  },
  paddedHeading: {
    marginTop: theme.spacing(8),
  },
}));

// Local state
interface ILocalState {
  organizationName: string;
  sidechainURL: string;
  error: string;
}

// Local default state
const DefaultLocalState: ILocalState = {
  organizationName: "",
  sidechainURL: "",
  error: "",
};

// Local actions
const LocalAction = {
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
    case LocalAction.SetOrganizationName: {
      return {
        ...state,
        error: "",
        organizationName: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetSidechainURL: {
      return {
        ...state,
        error: "",
        sidechainURL: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetError: {
      return {
        ...state,
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
  const reduxDispatch = useDispatch();
  const [{ organizationName, sidechainURL, error }, dispatch] = useReducer(
    LocalReducer,
    DefaultLocalState
  );

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

        <Typography
          className={`${classes.subHeading} ${classes.paddedHeading}`}
        >
          You can configure the domains where the REST API can connect to the
          Geth nodes.
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
          <Typography className={classes.error} variant="body2" color="error">
            {error}
          </Typography>
        )}
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          size="large"
          onClick={() => {
            if (!organizationName) {
              dispatch({
                type: LocalAction.SetError,
                payload: { string: "Please fill organization name field" },
              });
              return;
            }

            if (!sidechainURL) {
              dispatch({
                type: LocalAction.SetError,
                payload: { string: "Please fill sidechain URL field" },
              });
              return;
            }

            reduxDispatch(configureSidechain([organizationName, sidechainURL]));
            history.push(Routes.SETUP_SIGNING_AUTHORITY);
          }}
        >
          Continue
        </Button>
      </Grid>
    </Grid>
  );
};

export default SetupSidechain;

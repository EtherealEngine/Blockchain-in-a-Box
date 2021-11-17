import React, { useReducer, useEffect, useState } from "react";
import {
  Button,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { ActionResult } from "../models/Action";
import { IBasePayload, IStringPayload } from "../models/IPayloads";
import { useNavigate } from "react-router-dom";
import Routes from "../constants/Routes";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/Store";
import axios from "axios";


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
  const navigate = useNavigate();
  const [sideChainError, setsideChainError] = useState({ orgNameValue: false, sidechainURLvalid: false });

  useEffect(() => {
    (async () => {
      let respn = await axios.post("http://af2fc18b539ee488984fa4e58de37686-1454411376.us-west-1.elb.amazonaws.com/api/v1/authorizeServer", { "authSecretKey": "secret" });
      let { data } = await respn
      if (data.status === "success") {
        localStorage.setItem("accessToken", data.accessToken);
      }
    })()

  }, [])

  const { email } = useSelector(
    (state: RootState) => state.admin
  );

  const [{ organizationName, sidechainURL, isLoading, error }, dispatch] = useReducer(
    LocalReducer,
    DefaultLocalState
  );


  const goToNextPage = () => {
    let emailData: string | undefined = "";
    if (organizationName && sidechainURL && validateUrl(sidechainURL)) {
      if (!email) {
        emailData = localStorage.getItem('email')?.trim();
      } else {
        emailData = email;
      }
      let setupObj = { organizationName, sidechainURL, email: emailData };
      console.log("TST ", email);
      localStorage.setItem('setupData', JSON.stringify(setupObj));
      navigate(Routes.SETUP_SIGNING_AUTHORITY);
    }

  }

  const validateUrl = (value: string): Boolean => {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
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
          error={sideChainError.orgNameValue}
          variant="outlined"
          label="Organization Name"
          placeholder="Enter organization name"
          value={organizationName}
          onChange={(event) => {
            dispatch({
              type: LocalAction.SetOrganizationName,
              payload: { string: event.target.value },
            })
          }
          }
          required
        />

        <Typography className={`${classes.subHeading} ${classes.paddedHeading}`}>
          You can configure the domains where the REST API can connect to the Geth nodes.
        </Typography>

        <TextField
          className={classes.textbox}
          error={sideChainError.sidechainURLvalid}
          variant="outlined"
          label="Sidechain URL"
          placeholder="Enter sidechain URL"
          value={sidechainURL}
          onChange={(event) => {
            dispatch({
              type: LocalAction.SetSidechainURL,
              payload: { string: event.target.value },
            })
            event.target.value.length && validateUrl(event.target.value) ? setsideChainError({ ...sideChainError, sidechainURLvalid: false }) : setsideChainError({ ...sideChainError, sidechainURLvalid: true })
          }

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

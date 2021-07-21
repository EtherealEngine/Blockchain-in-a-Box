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
import "../App.css";
import { useHistory } from "react-router-dom";
import Routes from "../constants/Routes";

const useStyles = makeStyles((theme) => ({
  parentBox: {
    marginTop: "10vh",
    marginBottom: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: 500,
  },
  heading: {
    textAlign: "center",
  },
  subHeading: {
    marginTop: theme.spacing(3),
  },
  button: {
    marginTop: theme.spacing(3),
  },
  bold: {
    fontWeight: "bold",
  },
  red: {
    color: "#FF0000",
  },
  marginTop2: {
    marginTop: theme.spacing(2),
  },
  marginTop4: {
    marginTop: theme.spacing(4),
  },
  marginTop6: {
    marginTop: theme.spacing(6),
  },
}));

// Local state
interface ILocalState {
  mnemonic: string;
  twoFAPassword: string;
  isLoading: boolean;
  error: string;
}

// Local default state
const DefaultLocalState: ILocalState = {
  mnemonic: "",
  twoFAPassword: "",
  isLoading: false,
  error: "",
};

// Local actions
const LocalAction = {
  ToggleLoading: "ToggleLoading",
  SetMnemonic: "SetMnemonic",
  Set2FAPassword: "Set2FAPassword",
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
    case LocalAction.SetMnemonic: {
      return {
        ...state,
        mnemonic: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.Set2FAPassword: {
      return {
        ...state,
        twoFAPassword: (action.payload as IStringPayload).string,
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

const SetupSigningAuthority: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();
  const [{ mnemonic, twoFAPassword, isLoading, error }, dispatch] =
    useReducer(LocalReducer, DefaultLocalState);

  return (
    <Grid container justifyContent="center">
      <Grid className={classes.parentBox} item>
        <Typography className={classes.heading} variant="h4">
          Set Up A Signing Authority
        </Typography>

        <Typography className={classes.subHeading}>
          As the owner of the blockchain, you are acting as the treasury and
          signing authority on transactions.
        </Typography>

        <Typography className={classes.marginTop2}>
          You can use the generated mnemonic, or provide your own. Pick a 2FA
          password that you will remember, but that is hard to guess.
        </Typography>

        <Typography className={`${classes.marginTop2} ${classes.bold}`}>
          Never share your private key with anyone.
        </Typography>

        <TextField
          className={classes.marginTop4}
          variant="outlined"
          label="Mnemonic"
          placeholder="Enter mnemonic"
          value={mnemonic}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetMnemonic,
              payload: { string: event.target.value },
            })
          }
        />

        <TextField
          className={classes.marginTop4}
          variant="outlined"
          label="2FA Password (something you will remember and hard to guess)"
          placeholder="Enter 2FA password"
          value={twoFAPassword}
          onChange={(event) =>
            dispatch({
              type: LocalAction.Set2FAPassword,
              payload: { string: event.target.value },
            })
          }
        />

        <Typography className={classes.marginTop4}>
          <span className={`${classes.bold} ${classes.red}`}>
            Write your mnemonic and 2FA password down on paper and store in a
            secure place.
          </span>{" "}
          The 2FA password will be used to view or change your private keys, in
          the event that your email is compromised. Treat this like a password
          and <span className={classes.bold}>keep it somewhere safe.</span>
        </Typography>

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Button
          className={`${classes.button} ${classes.marginTop6}`}
          variant="contained"
          color="primary"
          size="large"
          onClick={() => {
            history.push(Routes.SETUP);
          }}
        >
          Continue
        </Button>
      </Grid>
    </Grid>
  );
};

export default SetupSigningAuthority;

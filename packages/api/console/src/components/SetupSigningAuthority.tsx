import React, { useReducer } from "react";
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  makeStyles,
  OutlinedInput,
  Typography,
} from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { ActionResult } from "../models/Action";
import {
  IBasePayload,
  IStringPayload,
} from "../models/IPayloads";
import { useHistory } from "react-router-dom";
import Routes from "../constants/Routes";
import "../App.css";

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
  formLabel: {
    padding: "0 10px",
    background: "white",
  },
}));

// Local state
interface ILocalState {
  mnemonic: string;
  showMnemonic: boolean;
  twoFAPassword: string;
  showTwoFAPassword: boolean;
  isLoading: boolean;
  error: string;
}

// Local default state
const DefaultLocalState: ILocalState = {
  mnemonic: "",
  showMnemonic: false,
  twoFAPassword: "",
  showTwoFAPassword: false,
  isLoading: false,
  error: "",
};

// Local actions
const LocalAction = {
  ToggleLoading: "ToggleLoading",
  SetMnemonic: "SetMnemonic",
  ToggleMnemonic: "ToggleMnemonic",
  Set2FAPassword: "Set2FAPassword",
  Toggle2FAPassword: "Toggle2FAPassword",
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
    case LocalAction.ToggleMnemonic: {
      return {
        ...state,
        showMnemonic: !state.showMnemonic,
      };
    }
    case LocalAction.Set2FAPassword: {
      return {
        ...state,
        twoFAPassword: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.Toggle2FAPassword: {
      return {
        ...state,
        showTwoFAPassword: !state.showTwoFAPassword,
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
  const [
    {
      mnemonic,
      showMnemonic,
      twoFAPassword,
      showTwoFAPassword,
      isLoading,
      error,
    },
    dispatch,
  ] = useReducer(LocalReducer, DefaultLocalState);

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

        <FormControl className={classes.marginTop4} variant="outlined">
          <InputLabel
            className={classes.formLabel}
            htmlFor="outlined-adornment-mnemonic"
          >
            Mnemonic
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-mnemonic"
            placeholder="Enter mnemonic"
            type={showMnemonic ? "text" : "password"}
            value={mnemonic}
            onChange={(event) =>
              dispatch({
                type: LocalAction.SetMnemonic,
                payload: { string: event.target.value },
              })
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    dispatch({ type: LocalAction.ToggleMnemonic });
                  }}
                  edge="end"
                >
                  {showMnemonic ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>

        <FormControl className={classes.marginTop4} variant="outlined">
          <InputLabel
            className={classes.formLabel}
            htmlFor="outlined-adornment-twoFAPassword"
          >
            2FA Password (easy to remember and hard to guess)
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-twoFAPassword"
            placeholder="Enter 2FA password"
            type={showTwoFAPassword ? "text" : "password"}
            value={twoFAPassword}
            onChange={(event) =>
              dispatch({
                type: LocalAction.Set2FAPassword,
                payload: { string: event.target.value },
              })
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    dispatch({ type: LocalAction.Toggle2FAPassword });
                  }}
                  edge="end"
                >
                  {showTwoFAPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>

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
            history.push(Routes.SETUP_TREASURE);
          }}
        >
          Continue
        </Button>
      </Grid>
    </Grid>
  );
};

export default SetupSigningAuthority;

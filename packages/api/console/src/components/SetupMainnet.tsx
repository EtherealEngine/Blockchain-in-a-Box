import React, { useReducer } from "react";
import {
  Box,
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
import { IBasePayload, IStringPayload } from "../models/IPayloads";
import { useNavigate } from "react-router-dom";
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
    width: "100%"
  },
  bold: {
    fontWeight: "bold",
  },
  marginTop2: {
    marginTop: theme.spacing(2),
  },
  marginTop4: {
    marginTop: theme.spacing(4),
  },
  formLabel: {
    padding: "0 10px",
    background: "white",
  },
}));

// Local state
interface ILocalState {
  mainnetMnemonic: string;
  showMnemonic: boolean;
  isLoading: boolean;
  error: string;
}

// Local default state
const DefaultLocalState: ILocalState = {
  mainnetMnemonic: "",
  showMnemonic: false,
  isLoading: false,
  error: "",
};

// Local actions
const LocalAction = {
  ToggleLoading: "ToggleLoading",
  SetMnemonic: "SetMnemonic",
  ToggleMnemonic: "ToggleMnemonic",
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
        mainnetMnemonic: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.ToggleMnemonic: {
      return {
        ...state,
        showMnemonic: !state.showMnemonic,
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

const SetupMainnet: React.FunctionComponent = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [{ mainnetMnemonic, showMnemonic, isLoading, error }, dispatch] = useReducer(
    LocalReducer,
    DefaultLocalState
  );

  const goToNextPage = () => {
    let stateObj = localStorage.getItem('setupData');
    if (stateObj) {
      let stateObjData = JSON.parse(stateObj)
      let setupObj = { ...stateObjData, mainnetMnemonic };
      localStorage.setItem('setupData', JSON.stringify(setupObj));
      navigate(Routes.SETUP_INFURA);
    }

  }

  return (
    <Grid container justifyContent="center">
      <Grid className={classes.parentBox} item>
        <Typography className={classes.heading} variant="h4">
          Mainnet Ethereum Private Key Setup
        </Typography>

        <Typography className={classes.subHeading}>
          If you want to allow mainnet transactions, you will need to supply a
          private key. You can skip this step if you don’t plan to offer
          cross-chain transfer, or wish to set it up later.
        </Typography>

        <Typography className={classes.marginTop2}>
          You will need to provide the mnemonic for a wallet that has enough eth
          in it to mint the contracts. It is recommended that you set this up
          using Metamask.
        </Typography>

        <Typography className={`${classes.marginTop2} ${classes.bold}`}>
          Never share your private key with anyone.
        </Typography>

        <Typography className={`${classes.marginTop2} ${classes.bold}`}>
          Never keep more ethereum in your hot wallet than you need.
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
            value={mainnetMnemonic}
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

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Grid className={classes.marginTop4} spacing={4} container>
          <Grid container item xs={6}>
            <Button
              className={classes.button}
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => {
                navigate(Routes.SETUP_INFURA);
              }}
            >
              Skip
            </Button>
          </Grid>
          <Grid container item xs={6}>
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
      </Grid>
    </Grid>
  );
};

export default SetupMainnet;

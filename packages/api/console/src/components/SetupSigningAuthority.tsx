import React, { useEffect, useReducer } from "react";
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
import { IBasePayload, IStringPayload } from "../models/IPayloads";
import { useHistory } from "react-router-dom";
import Routes from "../constants/Routes";
import "../App.css";
import LoadingView from "./LoadingView";
import { GetSetupMnemonic, PostSetupVerifyMnemonic } from "../api/SetupApi";
import { RootState } from "../redux/Store";
import { useDispatch, useSelector } from "react-redux";
import { setError, setIsLoading, setSideChainMnemonic } from "../redux/slice/SetupReducer";

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
  error: {
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
  showMnemonic: boolean;
}

// Local default state
const DefaultLocalState: ILocalState = {
  showMnemonic: true,
};

// Local actions
const LocalAction = {
  ToggleMnemonic: "ToggleMnemonic",
};

// Local reducer
const LocalReducer = (
  state: ILocalState,
  action: ActionResult<IBasePayload>
): ILocalState => {
  switch (action.type) {
    case LocalAction.ToggleMnemonic: {
      return {
        ...state,
        showMnemonic: !state.showMnemonic,
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
  const [{ showMnemonic }, dispatch] = useReducer(
    LocalReducer,
    DefaultLocalState
  );
  const reduxDispatch = useDispatch();
  const { sideChainMnemonic, isLoading, error } = useSelector(
    (state: RootState) => state.setup
  );

  useEffect(() => {
    reduxDispatch(setError(""));
    initialize();
  }, []);

  const initialize = async () => {
    try {
      reduxDispatch(setIsLoading(true));
      const mnemonicResponse = await GetSetupMnemonic();
      reduxDispatch(setSideChainMnemonic(mnemonicResponse.mnemonic));
    } catch (err) {
      reduxDispatch(setError(err.message));
    }
  };

  if (isLoading) {
    return <LoadingView loadingText={"Please wait"} />;
  }

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
          You can use the generated mnemonic, or provide your own.
        </Typography>

        <Typography className={`${classes.marginTop2} ${classes.bold}`}>
          Never share your private key with anyone.
        </Typography>

        <FormControl className={classes.marginTop4} variant="outlined" required>
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
            value={sideChainMnemonic}
            onChange={(event) =>
              reduxDispatch(setSideChainMnemonic(event.target.value))
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

        <Typography className={classes.marginTop4}>
          <span className={`${classes.bold} ${classes.red}`}>
            Write your mnemonic down on paper and store in a secure place.
          </span>
        </Typography>

        {error && (
          <Typography className={classes.error} variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Button
          className={`${classes.button} ${classes.marginTop6}`}
          variant="contained"
          color="primary"
          size="large"
          onClick={async () => {
            if (!sideChainMnemonic) {
              reduxDispatch(setError("Please fill mnemonic field"));
              return;
            }
            
            reduxDispatch(setIsLoading(true));
            const verifyResponse = await PostSetupVerifyMnemonic(sideChainMnemonic);
            if (!verifyResponse.isValid) {
              reduxDispatch(setError("Please enter a valid mnemonic"));
              return;
            }

            reduxDispatch(setError(""));
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

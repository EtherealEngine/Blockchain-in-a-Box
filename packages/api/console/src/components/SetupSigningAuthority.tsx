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
import { useNavigate } from "react-router-dom";
import Routes from "../constants/Routes";
import "../App.css";
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
  signingAuthorityMnemonic: string;
  showMnemonic: boolean;
  showPrivateKey: boolean;
  showAddress: boolean;
  signingAuthorityPrivateKey: string
  signingAuthorityAddress: string
  isLoading: boolean;
  error: string;
}

// Local default state
const DefaultLocalState: ILocalState = {
  signingAuthorityMnemonic: "",
  showMnemonic: false,
  showPrivateKey: false,
  showAddress: false,
  signingAuthorityAddress: "",
  signingAuthorityPrivateKey: "",
  isLoading: false,
  error: "",
};

// Local actions
const LocalAction = {
  ToggleLoading: "ToggleLoading",
  SetMnemonic: "SetMnemonic",
  ToggleMnemonic: "ToggleMnemonic",
  TogglePrivateKey: "TogglePrivateKey",
  SetPrivateKey: "SetPrivateKey",
  SetAddress: "SetAddress",
  ToogleAddress: "ToogleAddress",
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
        signingAuthorityMnemonic: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.ToggleMnemonic: {
      return {
        ...state,
        showMnemonic: !state.showMnemonic,
      };
    }
    case LocalAction.TogglePrivateKey: {
      return {
        ...state,
        showPrivateKey: !state.showPrivateKey,
      };
    }
    case LocalAction.ToogleAddress: {
      return {
        ...state,
        showAddress: !state.showAddress,
      };
    }
    case LocalAction.SetPrivateKey: {
      return {
        ...state,
        signingAuthorityPrivateKey: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetAddress: {
      return {
        ...state,
        signingAuthorityAddress: (action.payload as IStringPayload).string,
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
  const navigate = useNavigate();
  const [
    {
      signingAuthorityMnemonic,
      showMnemonic,
      showPrivateKey,
      signingAuthorityPrivateKey,
      showAddress,
      signingAuthorityAddress,
      isLoading,
      error,
    },
    dispatch,
  ] = useReducer(LocalReducer, DefaultLocalState);

  useEffect(() => {
    (async () => {
      let accessToken = localStorage.getItem('accessToken');
      let bearer = `Bearer ${accessToken}`
      const headers = {
        'Content-Type': 'application/json',
        'authorization': bearer
      }
      let resp = await axios.post(`http://af2fc18b539ee488984fa4e58de37686-1454411376.us-west-1.elb.amazonaws.com/api/v1/wallet`, {}, { headers });
      let { data } = await resp;
      console.log("DATA ", data);
      if (data.status === "success") {
        let stateObj = localStorage.getItem('setupData');
        if (stateObj) {
          let stateObjData = JSON.parse(stateObj);
          dispatch({
            type: LocalAction.SetMnemonic,
            payload: { string: data.userMnemonic },
          })
          dispatch({
            type: LocalAction.SetPrivateKey,
            payload: { string: data.privateKey },
          });
          dispatch({
            type: LocalAction.SetAddress,
            payload: { string: data.userAddress },
          })
          stateObj = { ...stateObjData, signingAuthorityMnemonic: data.userMnemonic, signingAuthorityAddress: data.userAddress, signingAuthorityPrivateKey: data.privateKey }
          localStorage.setItem('setupData', JSON.stringify(stateObj));
        }
      }

    })()
  }, [])

  const goToNextPage = () => {
    let stateObj = localStorage.getItem('setupData')
    if (stateObj) {
      let stateObjData = JSON.parse(stateObj);
      stateObj = { ...stateObjData, signingAuthorityMnemonic, signingAuthorityAddress, signingAuthorityPrivateKey }
      localStorage.setItem('setupData', JSON.stringify(stateObj));
      navigate(Routes.SETUP_TREASURE);
    }
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
            value={signingAuthorityMnemonic}
            readOnly={true}
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

        <FormControl className={classes.marginTop4} variant="outlined" required>
          <InputLabel
            className={classes.formLabel}
            htmlFor="outlined-adornment-mnemonic"
          >
            Authority Private Key
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-mnemonic"
            placeholder="Authority Private Key"
            type={showPrivateKey ? "text" : "password"}
            value={signingAuthorityPrivateKey}
            readOnly={true}
            onChange={(event) =>
              dispatch({
                type: LocalAction.SetPrivateKey,
                payload: { string: event.target.value },
              })
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    dispatch({ type: LocalAction.TogglePrivateKey });
                  }}
                  edge="end"
                >
                  {showMnemonic ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>

        <FormControl className={classes.marginTop4} variant="outlined" required>
          <InputLabel
            className={classes.formLabel}
            htmlFor="outlined-adornment-mnemonic"
          >
            Authority Address
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-mnemonic"
            placeholder="Authority Address"
            type={showAddress ? "text" : "password"}
            value={signingAuthorityAddress}
            readOnly={true}
            onChange={(event) =>
              dispatch({
                type: LocalAction.SetAddress,
                payload: { string: event.target.value },
              })
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    dispatch({ type: LocalAction.ToogleAddress });
                  }}
                  edge="end"
                >
                  {showAddress ? <VisibilityOff /> : <Visibility />}
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
            goToNextPage()
          }}
        >
          Continue
        </Button>
      </Grid>
    </Grid>
  );
};

export default SetupSigningAuthority;

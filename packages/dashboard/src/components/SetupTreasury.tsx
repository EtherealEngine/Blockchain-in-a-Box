import React, { useEffect, useReducer } from "react";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  makeStyles,
  OutlinedInput,
  TextField,
  Typography,
} from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { ActionResult } from "../models/Action";
import { IBasePayload, IBooleanPayload, INumberPayload, IStringPayload } from "../models/IPayloads";
import { useHistory } from "react-router-dom";
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
  mintingFee: {
    width: 150,
  },
  bold: {
    fontWeight: "bold",
  },
  red: {
    color: "#FF0000",
  },
  marginLeft1: {
    marginLeft: theme.spacing(1),
  },
  marginLeft3: {
    marginLeft: theme.spacing(3),
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
  marginTop8: {
    marginTop: theme.spacing(8),
  },
  formLabel: {
    padding: "0 10px",
    background: "white",
  },
}));

// Local state
interface ILocalState {
  treasuryMnemonic: string;
  showMnemonic: boolean;
  showPrivateKey: boolean;
  treasuryPrivateKey: string
  showAddress: boolean;
  treasuryAddress: string
  currencyContractName: string;
  currencyContractSymbol: string;
  currencyMarketCap: string;
  assetContractName: string;
  assetContractSymbol: string;
  assetTokenDescription: string;
  usersMintAssets: boolean;
  mintingFee: number;
  isLoading: boolean;
  error: string;
}

// Local default state
const DefaultLocalState: ILocalState = {
  treasuryMnemonic: "",
  showMnemonic: false,
  showPrivateKey: false,
  showAddress: false,
  treasuryAddress: "",
  treasuryPrivateKey: "",
  currencyContractName: "",
  currencyContractSymbol: "",
  currencyMarketCap: "",
  assetContractName: "",
  assetContractSymbol: "",
  assetTokenDescription: "",
  usersMintAssets: false,
  mintingFee: 10,
  isLoading: false,
  error: "",
};

// Local actions
const LocalAction = {
  ToggleLoading: "ToggleLoading",
  SetMnemonic: "SetMnemonic",
  ToggleMnemonic: "ToggleMnemonic",
  TogglePrivateKey: "TogglePrivateKey",
  ToogleAddress: "ToogleAddress",
  SetPrivateKey: "SetPrivateKey",
  SetAddress: "SetAddress",
  SetCurrencyContractName: "SetCurrencyContractName",
  SetCurrencyContractSymbol: "SetCurrencyContractSymbol",
  SetCurrencyMarketCap: "SetCurrencyMarketCap",
  SetAssetContractName: "SetAssetContractName",
  SetAssetContractSymbol: "SetAssetContractSymbol",
  SetAssetTokenDescription: "SetAssetTokenDescription",
  SetUsersMintAssets: "SetUsersMintAssets",
  SetMintingFee: "SetMintingFee",
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
        treasuryMnemonic: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetPrivateKey: {
      return {
        ...state,
        treasuryPrivateKey: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetAddress: {
      return {
        ...state,
        treasuryAddress: (action.payload as IStringPayload).string,
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
    case LocalAction.SetCurrencyContractName: {
      return {
        ...state,
        currencyContractName: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetCurrencyContractSymbol: {
      return {
        ...state,
        currencyContractSymbol: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetCurrencyMarketCap: {
      return {
        ...state,
        currencyMarketCap: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetAssetContractName: {
      return {
        ...state,
        assetContractName: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetAssetContractSymbol: {
      return {
        ...state,
        assetContractSymbol: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetAssetTokenDescription: {
      return {
        ...state,
        assetTokenDescription: (action.payload as IStringPayload).string,
      };
    }
    case LocalAction.SetUsersMintAssets: {
      return {
        ...state,
        usersMintAssets: (action.payload as IBooleanPayload).boolean,
      };
    }
    case LocalAction.SetMintingFee: {
      return {
        ...state,
        mintingFee: (action.payload as INumberPayload).number,
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

const SetupTreasury: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();
  const [
    {
      treasuryMnemonic,
      showMnemonic,
      showPrivateKey,
      treasuryPrivateKey,
      showAddress,
      treasuryAddress,
      currencyContractName,
      currencyContractSymbol,
      currencyMarketCap,
      assetContractName,
      assetContractSymbol,
      assetTokenDescription,
      usersMintAssets,
      mintingFee,
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
          // stateObj = { ...stateObjData, userMnemonic: data.userMnemonic, userAddress: data.userAddress, privateKey: data.privateKey }
          // localStorage.setItem('setupData', JSON.stringify(stateObj));
        }
      }

    })()
    // let stateObj = localStorage.getItem('setupData');
    // if (stateObj) {
    //   let stateObjData = JSON.parse(stateObj);
    //   console.log("stateObjData ", stateObjData);
    //   dispatch({
    //     type: LocalAction.SetMnemonic,
    //     payload: { string: stateObjData.userMnemonic },
    //   })
    //   dispatch({
    //     type: LocalAction.SetPrivateKey,
    //     payload: { string: stateObjData.privateKey },
    //   });
    //   dispatch({
    //     type: LocalAction.SetTreasuryPrivateKey,
    //     payload: { string: stateObjData.privateKey },
    //   })
    //   console.log("stateObjData stringfy ", JSON.stringify(JSON.parse(stateObj)));

    //   localStorage.setItem('setupData', JSON.stringify(JSON.parse(stateObj)));
    // }
  }, [])

  const goToNextPage = () => {
    let stateObj = localStorage.getItem('setupData')
    if (stateObj) {
      let stateObjData = JSON.parse(stateObj);
      stateObj = {
        ...stateObjData, treasuryMnemonic, treasuryPrivateKey, treasuryAddress, currencyContractName,
        currencyContractSymbol,
        currencyMarketCap,
        assetContractName,
        assetContractSymbol,
        assetTokenDescription,
        usersMintAssets,
        mintingFee,
      }
      localStorage.setItem('setupData', JSON.stringify(stateObj));
      history.push(Routes.SETUP_MAINNET);
    }
  }

  return (
    <Grid container justifyContent="center">
      <Grid className={classes.parentBox} item>
        <Typography className={classes.heading} variant="h4">
          Set Up Your Treasury
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
            value={treasuryMnemonic}
            readOnly={true}
            // onChange={(event) =>
            //   dispatch({
            //     type: LocalAction.SetMnemonic,
            //     payload: { string: event.target.value },
            //   })
            // }
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
            value={treasuryPrivateKey}
            readOnly={true}
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
            value={treasuryAddress}
            readOnly={true}
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
          The ERC20 standard currency contract that is included with this chain
          allows you to set the name, symbol and market cap of coin in
          circulation. You can leave these as default or provide your own.
        </Typography>

        <TextField
          className={classes.marginTop4}
          variant="outlined"
          label="Currency Contract Name"
          placeholder="Enter currency contract name"
          value={currencyContractName}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetCurrencyContractName,
              payload: { string: event.target.value },
            })
          }
          required
        />

        <TextField
          className={classes.marginTop4}
          variant="outlined"
          label="Currency Contract Symbol"
          placeholder="Enter currency contract symbol"
          value={currencyContractSymbol}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetCurrencyContractSymbol,
              payload: { string: event.target.value },
            })
          }
          required
        />

        <TextField
          className={classes.marginTop4}
          variant="outlined"
          label="Currency Market Cap"
          placeholder="Enter currency market cap"
          value={currencyMarketCap}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetCurrencyMarketCap,
              payload: { string: event.target.value },
            })
          }
          required
        />

        <Typography className={classes.marginTop6}>
          The ERC721 NFT inventory contract that is included with this chain
          allows you to set the name, symbol and market cap of coin in
          circulation. You can leave these as default or provide your own.
        </Typography>

        <TextField
          className={classes.marginTop4}
          variant="outlined"
          label="Asset Contract Name"
          placeholder="Enter asset contract name"
          value={assetContractName}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetAssetContractName,
              payload: { string: event.target.value },
            })
          }
          required
        />

        <TextField
          className={classes.marginTop4}
          variant="outlined"
          label="Asset Contract Symbol"
          placeholder="Enter asset contract symbol"
          value={assetContractSymbol}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetAssetContractSymbol,
              payload: { string: event.target.value },
            })
          }
          required
        />

        <TextField
          className={classes.marginTop4}
          variant="outlined"
          label="Default Asset Token Description (leave blank for none)"
          placeholder="Enter default asset token description"
          value={assetTokenDescription}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetAssetTokenDescription,
              payload: { string: event.target.value },
            })
          }
        />

        <Typography className={classes.marginTop6}>
          By default, users can mint assets. If you uncheck this option, only
          the treasury will be allowed to mint new assets.
        </Typography>

        <Typography className={`${classes.marginTop2} ${classes.bold}`}>
          This cannot be changed without redeploying the contracts.
        </Typography>

        <Typography className={classes.marginTop2}>
          For user-generated content platforms, you should leave this box
          checked. For a game where users receive preminted assets and cannot
          mint their own, you should leave this box unchecked.
        </Typography>

        <FormControlLabel
          className={`${classes.marginTop2} ${classes.marginLeft1}`}
          control={
            <Checkbox
              color="primary"
              value={usersMintAssets}
              onChange={(event) =>
                dispatch({
                  type: LocalAction.SetUsersMintAssets,
                  payload: { boolean: event.target.value },
                })
              }
            />
          }
          label="Users can mint assets"
        />

        <Typography className={classes.marginTop2}>
          Users can be charged a fee for minting. The default is 10, to prevent
          spam, but you can set this to 0 for free minting.
        </Typography>

        <TextField
          className={`${classes.mintingFee} ${classes.marginTop4} ${classes.marginLeft3}`}
          variant="outlined"
          label="Minting Fee"
          type="number"
          value={mintingFee}
          onChange={(event) =>
            dispatch({
              type: LocalAction.SetMintingFee,
              payload: { number: event.target.value },
            })
          }
        />

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Button
          className={`${classes.button} ${classes.marginTop8}`}
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

export default SetupTreasury;

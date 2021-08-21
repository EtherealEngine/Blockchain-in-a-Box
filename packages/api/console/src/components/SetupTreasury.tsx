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
import {
  IBasePayload,
  IBooleanPayload,
  INumberPayload,
  IStringPayload,
} from "../models/IPayloads";
import { useHistory } from "react-router-dom";
import Routes from "../constants/Routes";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/Store";
import {
  setAssetContractDescription,
  setAssetContractName,
  setAssetContractSymbol,
  setAssetMintable,
  setCurrencyContractMarketCap,
  setCurrencyContractName,
  setCurrencyContractSymbol,
  setError,
  setIsLoading,
  setMintingFee,
  setTreasuryMnemonic,
} from "../redux/slice/SetupReducer";
import { GetSetupMnemonic, PostSetupVerifyMnemonic } from "../api/SetupApi";
import LoadingView from "./LoadingView";

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
  error: {
    marginTop: theme.spacing(3),
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

const SetupTreasury: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();
  const [{ showMnemonic }, dispatch] = useReducer(
    LocalReducer,
    DefaultLocalState
  );
  const reduxDispatch = useDispatch();
  const {
    treasuryMnemonic,
    currencyContractName,
    currencyContractSymbol,
    currencyContractMarketCap,
    assetContractName,
    assetContractSymbol,
    assetContractDescription,
    assetMintable,
    mintingFee,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.setup);

  useEffect(() => {
    reduxDispatch(setError(""));
    initialize();
  }, []);

  const initialize = async () => {
    try {
      reduxDispatch(setIsLoading(true));
      const mnemonicResponse = await GetSetupMnemonic();
      reduxDispatch(setTreasuryMnemonic(mnemonicResponse.mnemonic));
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
            onChange={(event) =>
              reduxDispatch(setTreasuryMnemonic(event.target.value))
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
            reduxDispatch(setCurrencyContractName(event.target.value))
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
            reduxDispatch(setCurrencyContractSymbol(event.target.value))
          }
          required
        />

        <TextField
          className={classes.marginTop4}
          variant="outlined"
          label="Currency Market Cap"
          placeholder="Enter currency market cap"
          value={currencyContractMarketCap}
          onChange={(event) =>
            reduxDispatch(setCurrencyContractMarketCap(event.target.value))
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
            reduxDispatch(setAssetContractName(event.target.value))
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
            reduxDispatch(setAssetContractSymbol(event.target.value))
          }
          required
        />

        <TextField
          className={classes.marginTop4}
          variant="outlined"
          label="Default Asset Token Description (leave blank for none)"
          placeholder="Enter default asset token description"
          value={assetContractDescription}
          onChange={(event) =>
            reduxDispatch(setAssetContractDescription(event.target.value))
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
              value={assetMintable}
              onChange={(event) =>
                reduxDispatch(setAssetMintable(event.target.checked))
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
            reduxDispatch(setMintingFee(parseInt(event.target.value)))
          }
        />

        {error && (
          <Typography className={classes.error} variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Button
          className={`${classes.button} ${classes.marginTop8}`}
          variant="contained"
          color="primary"
          size="large"
          onClick={async () => {
            if (!treasuryMnemonic) {
              reduxDispatch(setError("Please fill mnemonic field"));
              return;
            }

            if (!currencyContractName) {
              reduxDispatch(setError("Please fill currency contract name field"));
              return;
            }

            if (!currencyContractSymbol) {
              reduxDispatch(setError("Please fill currency contract symbol field"));
              return;
            }

            if (!currencyContractMarketCap) {
              reduxDispatch(setError("Please fill currency contract market cap field"));
              return;
            }
            
            if (!assetContractName) {
              reduxDispatch(setError("Please fill asset contract name field"));
              return;
            }
            
            if (!assetContractSymbol) {
              reduxDispatch(setError("Please fill asset contract symbol field"));
              return;
            }
            
            reduxDispatch(setIsLoading(true));
            const verifyResponse = await PostSetupVerifyMnemonic(treasuryMnemonic);
            if (!verifyResponse.isValid) {
              reduxDispatch(setError("Please enter a valid mnemonic"));
              return;
            }

            reduxDispatch(setError(""));
            history.push(Routes.SETUP_MAINNET);
          }}
        >
          Continue
        </Button>
      </Grid>
    </Grid>
  );
};

export default SetupTreasury;

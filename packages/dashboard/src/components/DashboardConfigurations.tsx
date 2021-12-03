import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useReducer, useEffect } from "react";
import "../App.css";
import { ActionResult } from "../models/Action";
import {
  IBasePayload,
  IBooleanPayload,
  INumberPayload,
  IStringPayload,
} from "../models/IPayloads";
import { useDispatch, useSelector } from "react-redux";
import {
  getSideChainUrl,
  getSideChainUrlSuccess
} from "../redux/slice/DashboardReducer";
import { RootState } from "../redux/Store";
import LoadingView from "./LoadingView";
import {
  addNotification
} from "../redux/slice/SetupReducer";


const useStyles = makeStyles((theme) => ({
  rootBox: {
    padding: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    maxWidth: 500,
  },
  button: {
    width: 300,
    marginTop: 10,
  },
  textbox: {
    width: "100%",
    marginTop: theme.spacing(2),
  },
  mintingFee: {
    width: 150,
  },
  red: {
    color: "red",
  },
  green: {
    color: "#00CF5F",
  },
  bold: {
    fontWeight: "bold",
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
  organizationName: string;
  sidechainURL: string;
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
  data: any
}

// Local default state
const DefaultLocalState: ILocalState = {
  organizationName: "",
  sidechainURL: "",
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
  data: {}
};

// Local actions
const LocalAction = {
  ToggleLoading: "ToggleLoading",
  SETLOADVALUE: "Setloadvalue",
  SetOrganizationName: "SetOrganizationName",
  SetSidechainURL: "SetSidechainURL",
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
  console.log("action.payload ", action.payload);

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
    case LocalAction.SETLOADVALUE: {
      let { data } = action.payload

      return {
        ...state,
        assetContractName: data?.assetContractName,
        organizationName: data?.organizationName,
        sidechainURL: data?.sidechainURL,
        currencyContractName: data?.currencyContractName,
        currencyContractSymbol: data?.currencyContractSymbol,
        currencyMarketCap: data?.currencyMarketCap,
        assetContractSymbol: data?.assetContractSymbol,
        assetTokenDescription: data?.assetTokenDescription,
        usersMintAssets: data?.usersMintAssets === "false" ? false : true,
        mintingFee: data?.mintingFee,

      };
    }
    default: {
      return state;
    }
  }
};

const DashboardConfigurations: React.FunctionComponent = () => {
  const classes = useStyles();
  const [
    {
      organizationName,
      sidechainURL,
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
  const reduxDispatch = useDispatch();

  const { sideChaninLoading, getSideChainUrlData } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { notifications, setupLoader } = useSelector(
    (state: RootState) => state.setup
  );

  const getSideChainData = () => {
    reduxDispatch(getSideChainUrl())
  }

  useEffect(() => {
    getSideChainData();
  }, []);

  useEffect(() => {
    if (getSideChainUrlData && getSideChainUrlData['email']) {
      console.log("getSideChainUrlData ", getSideChainUrlData);
      dispatch({
        type: LocalAction.SETLOADVALUE,
        payload: { data: getSideChainUrlData },
      })
    }
  }, [getSideChainUrlData]);

  const saveConfig = () => {
    let stateObj = {
      ...getSideChainUrlData,
      organizationName,
      sidechainURL,
      currencyContractName,
      currencyContractSymbol,
      currencyMarketCap,
      assetContractName,
      assetContractSymbol,
      assetTokenDescription,
      usersMintAssets,
      mintingFee,
    }

    reduxDispatch(addNotification(stateObj));
  }


  if (sideChaninLoading || setupLoader) {
    return (<>
      <div>
        <LoadingView loadingText={"Loading"} />
      </div>
    </>);
  }

  return (

    <Box className={classes.rootBox}>
      <Typography variant={"subtitle1"}>
        Infura API Key:
        {
          getSideChainUrlData?.infuraApiKey ? (<span className={classes.green}>Configured ({getSideChainUrlData.infuraApiKey})</span>) : <span className={classes.red}>Not Ready</span>
        }
      </Typography>
      <Typography>
        You need to add an Infura API key and deploy contracts to mainnet.
      </Typography>
      {/* <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        Configure
      </Button> */}

      <Typography variant={"subtitle1"} className={classes.marginTop8}>
        Matic Vigil API Key:
        {
          getSideChainUrlData?.polygonApiKey ? (<span className={classes.green}>Configured ({getSideChainUrlData.polygonApiKey})</span>) : <span className={classes.red}>Not Ready</span>
        }
      </Typography>
      <Typography>
        You need to add a MaticVigil API key and deploy contracts to Polygon.
      </Typography>
      {/* <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        Configure
      </Button> */}

      <Typography variant={"subtitle1"} className={classes.marginTop8}>
        Pinata API Key:
        {
          getSideChainUrlData?.pinataApiKey ? (<span className={classes.green}>Configured ({getSideChainUrlData.pinataApiKey})</span>) : <span className={classes.red}>Not Ready</span>
        }
      </Typography>
      <Typography>
        You need to add a Pinata API key to host files on IPFS.
      </Typography>
      {/* <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        Configure
      </Button> */}

      <TextField
        className={`${classes.textbox} ${classes.marginTop8}`}
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
      />

      <Typography className={classes.marginTop4}>
        You can configure the domains where the REST API can connect to the Geth
        nodes.
      </Typography>

      <TextField
        className={`${classes.textbox} ${classes.marginTop4}`}
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
      />

      <Typography className={`${classes.bold} ${classes.marginTop4}`}>
        These options cannot be changed without deploying contracts.
      </Typography>

      <Typography className={classes.marginTop2}>
        The ERC20 standard currency contract that is included with this chain
        allows you to set the name, symbol and market cap of coin in
        circulation. You can leave these as default or provide your own.
      </Typography>

      <TextField
        className={`${classes.textbox} ${classes.marginTop4}`}
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
      />

      <TextField
        className={`${classes.textbox} ${classes.marginTop4}`}
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
      />

      <TextField
        className={`${classes.textbox} ${classes.marginTop4}`}
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
      />

      <Typography className={classes.marginTop8}>
        The ERC721 NFT inventory contract that is included with this chain
        allows you to set the name, symbol and market cap of coin in
        circulation. You can leave these as default or provide your own.
      </Typography>

      <TextField
        className={classes.textbox}
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
      />

      <TextField
        className={`${classes.textbox} ${classes.marginTop4}`}
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
      />

      <TextField
        className={`${classes.textbox} ${classes.marginTop4}`}
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
        By default, users can mint assets. If you uncheck this option, only the
        treasury will be allowed to mint new assets.
      </Typography>

      <Typography className={classes.marginTop4}>
        For user-generated content platforms, you should leave this box checked.
        For a game where users receive preminted assets and cannot mint their
        own, you should leave this box unchecked.
      </Typography>

      <FormControlLabel
        className={`${classes.marginTop4} ${classes.marginLeft1}`}
        control={
          <Checkbox
            color="primary"
            value={usersMintAssets}
            checked={usersMintAssets}
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

      <Typography className={classes.marginTop4}>
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
          saveConfig()
        }}
      >
        Save Configuration
      </Button>
    </Box>
  );
};

export default DashboardConfigurations;

import {
  Box,
  Button,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useReducer } from "react";
import "../App.css";
import { ActionResult } from "../models/Action";
import { IBasePayload, IStringPayload } from "../models/IPayloads";

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
  red: {
    color: "red",
  },
  green: {
    color: "#00CF5F",
  },
  bold: {
    fontWeight: "bold",
  },
  marginTop8: {
    marginTop: theme.spacing(8),
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
  isLoading: boolean;
  error: string;
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
  isLoading: false,
  error: "",
};

// Local actions
const LocalAction = {
  ToggleLoading: "ToggleLoading",
  SetOrganizationName: "SetOrganizationName",
  SetSidechainURL: "SetSidechainURL",
  SetCurrencyContractName: "SetCurrencyContractName",
  SetCurrencyContractSymbol: "SetCurrencyContractSymbol",
  SetCurrencyMarketCap: "SetCurrencyMarketCap",
  SetAssetContractName: "SetAssetContractName",
  SetAssetContractSymbol: "SetAssetContractSymbol",
  SetAssetTokenDescription: "SetAssetTokenDescription",
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
      isLoading,
      error,
    },
    dispatch,
  ] = useReducer(LocalReducer, DefaultLocalState);

  return (
    <Box className={classes.rootBox}>
      <Typography variant={"h6"}>
        Infura API Key: <span className={classes.green}>Configured</span>
      </Typography>
      <Typography>
        You need to add an Infura API key and deploy contracts to mainnet.
      </Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        Configure
      </Button>

      <Typography variant={"h6"} className={classes.marginTop8}>
        Matic Vigil API Key: <span className={classes.red}>Not Configured</span>
      </Typography>
      <Typography>
        You need to add a MaticVigil API key and deploy contracts to Polygon.
      </Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        Configure
      </Button>

      <Typography variant={"h6"} className={classes.marginTop8}>
        Pinata API Key: <span className={classes.red}>Not Configured</span>
      </Typography>
      <Typography>
        You need to add a Pinata API key to host files on IPFS.
      </Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        Configure
      </Button>

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
      />

      <Typography>
        You can configure the domains where the REST API can connect to the Geth
        nodes.
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
      />

      <Typography className={classes.bold}>
        These options cannot be changed without deploying contracts.
      </Typography>

      <Typography>
        The ERC20 standard currency contract that is included with this chain
        allows you to set the name, symbol and market cap of coin in
        circulation. You can leave these as default or provide your own.
      </Typography>

      <TextField
        className={classes.textbox}
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
        className={classes.textbox}
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
        className={classes.textbox}
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

      <Typography>
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
          className={classes.textbox}
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
          className={classes.textbox}
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

      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default DashboardConfigurations;

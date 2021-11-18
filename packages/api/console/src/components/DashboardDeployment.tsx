import React, { useEffect } from "react";
import Deployer from "./Deployer";
import { Box, Button, makeStyles, Typography } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { setDeployment } from "../redux/slice/SetupReducer";
import { RootState } from "../redux/Store";
import LoadingView from "./LoadingView";
import { getSideChainUrl } from "../redux/slice/DashboardReducer";


const useStyles = makeStyles((theme) => ({
  rootBox: {
    padding: theme.spacing(8),
    maxWidth: 800,
  },
  button: {
    width: 300,
    marginTop: 10,
  },
  green: {
    color: "#00CF5F",
  },
  red: {
    color: "red",
  },
  marginTop8: {
    marginTop: theme.spacing(8),
  },
  marginTop12: {
    marginTop: theme.spacing(12),
  },
}));

const DashboardDeployment: React.FunctionComponent = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { notifications, deploymentLoading } = useSelector(
    (state: RootState) => state.setup
  );
  const { sideChaninLoading, getSideChainUrlData } = useSelector(
    (state: RootState) => state.dashboard
  );

  const getSideChainData = () => {
    dispatch(getSideChainUrl())
  }
  useEffect(() => {
    getSideChainData();
  }, []);

  const deployContact = (networkType: string) => {
    dispatch(setDeployment(networkType));
  }


  if (deploymentLoading || sideChaninLoading) {
    return (<>
      <div>
        <LoadingView loadingText={"Loading"} />
      </div>
    </>);
  }

  return (
    <Box className={classes.rootBox}>
      <Typography variant={"subtitle1"}>
        Sidechain Status:
        {
          getSideChainUrlData?.sidechainContractDeployed == "true" ? (<span className={classes.green}>Configured</span>) : <span className={classes.red}>Not Ready</span>
        }
      </Typography>
      {/* <Deployer target="deploy-dev" /> */}
      <Button
        style={{
          width: 300,
          marginTop: 10,
        }}
        variant="contained"
        color="primary"
        size="large"
        onClick={e => deployContact("development")}
      >
        Deploy
      </Button>

      <Typography variant={"subtitle1"} className={classes.marginTop8}>
        Mainnet Status:
        {
          (getSideChainUrlData?.mainnetContractDeployed == "true" && getSideChainUrlData?.infuraApiKey) ? (<span className={classes.green}>Configured</span>) : <span className={classes.red}>Not Ready</span>
        }
      </Typography>
      <Typography>You need to deploy the contracts to the mainnet.</Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
        onClick={e => deployContact("mainnet")}
      >
        Deploy Contracts
      </Button>

      <Typography variant={"subtitle1"} className={classes.marginTop8}>
        Polygon Status:
        {
          (getSideChainUrlData?.polygonContractDeployed == "true" && getSideChainUrlData?.polygonApiKey) ? (<span className={classes.green}>Configured</span>) : <span className={classes.red}>Not Ready</span>
        }
      </Typography>
      <Typography>
        You need to add a MaticVigil API key and deploy contracts to Polygon.
      </Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
        onClick={e => deployContact("polygon")}
      >
        Configuration
      </Button>
    </Box>
  );
};

export default DashboardDeployment;


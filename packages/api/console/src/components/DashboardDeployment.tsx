import React from "react";
import Deployer from "./Deployer";
import { Box, Button, makeStyles, Typography } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import "../App.css";

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

  return (
    <Box className={classes.rootBox}>
      <Typography variant={"subtitle1"}>
        Sidechain Status: <span className={classes.green}>Deployed</span>
      </Typography>
      <Deployer target="deploy-dev" />

      <Typography variant={"subtitle1"} className={classes.marginTop8}>
        Mainnet Status: <span className={classes.red}>Not Deployed</span>
      </Typography>
      <Typography>You need to deploy the contracts to the mainnet.</Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        Deploy Contracts
      </Button>

      <Typography variant={"subtitle1"} className={classes.marginTop8}>
        Polygon Status: <span className={classes.red}>Not Ready</span>
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
        Configuration
      </Button>
    </Box>
  );
};

export default DashboardDeployment;

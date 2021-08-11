import { Box, Button, makeStyles, Typography } from "@material-ui/core";
import React from "react";
import "../App.css";

const useStyles = makeStyles((theme) => ({
  rootBox: {
    padding: theme.spacing(8),
  },
  button: {
    width: 300,
    marginTop: 20,
  },
  marginTop2: {
    marginTop: theme.spacing(2),
  },
  marginTop8: {
    marginTop: theme.spacing(8),
  },
  marginTop12: {
    marginTop: theme.spacing(12),
  },
}));

const DashboardSecurity: React.FunctionComponent = () => {
  const classes = useStyles();

  return (
    <Box className={classes.rootBox}>
      <Typography variant={"subtitle1"}>JWT Signing Keys</Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        View API Key
      </Button>
      <br />
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        Regenerate API Keys
      </Button>

      <Typography variant={"subtitle1"} className={classes.marginTop8}>
        Signing Authority
      </Typography>
      <Typography className={classes.marginTop2}>
        Address: 0xebDeFbB0B1efc88603BF3Ea7DCac4d11628Fb862
      </Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        View Private Key
      </Button>
      <br />
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        Change Private Key
      </Button>

      <Typography variant={"subtitle1"} className={classes.marginTop8}>
        Treasury
      </Typography>
      <Typography className={classes.marginTop2}>
        Address: 0xebDeFbB0B1efc88603BF3Ea7DCac4d11628Fb862
      </Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        View Private Key
      </Button>
      <br />
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        Change Private Key
      </Button>

      <Typography variant={"subtitle1"} className={classes.marginTop8}>
        User Settings
      </Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        Delete Account
      </Button>
    </Box>
  );
};

export default DashboardSecurity;

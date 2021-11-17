import { Box, Button, Grid, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'
import Routes from '../constants/Routes';

const useStyles = makeStyles((theme) => ({
  parentBox: {
    marginTop: '20vh',
    marginBottom: theme.spacing(5),
  },
  subHeading: {
    textAlign: 'center',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  buttonsBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    marginTop: theme.spacing(3),
    width: 350,
  }
}));

const Welcome = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const openUrl = (e, url) => {
    window.open(url, '_blank');
  }

  return (
    <Grid container justifyContent="center" >
      <Grid className={classes.parentBox} item>
        <Typography variant='h4'>Blockchain-in-a-Box Rest API</Typography>
        <Typography className={classes.subHeading}>A batteries included blockchain for the metaverse.</Typography>
        <Box className={classes.buttonsBox}>
          <Button className={classes.button}
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate(Routes.LOGIN)}>
            Adminstrator Login
          </Button>
          <Button className={classes.button}
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => console.log("OpenAPI / Swagger UI")}>
            OpenAPI / Swagger UI
          </Button>
          <Button className={classes.button}
            variant="contained"
            color="secondary"
            size="large"
            onClick={(e) => openUrl(e, "http://a76ab76cfc49440a594d947189734303-848168955.us-west-1.elb.amazonaws.com")}>
            EthStats Dashboard
          </Button>
          <Button className={classes.button}
            variant="contained"
            color="secondary"
            size="large"
            onClick={(e) => openUrl(e, "http://a04d1d57d648441d793c178bfae2784e-1027067517.us-west-1.elb.amazonaws.com")}>
            Remix IDE
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Welcome;

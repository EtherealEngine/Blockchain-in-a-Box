import { Box, Button, Grid, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { useHistory } from 'react-router-dom';
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
  const history = useHistory();

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
            onClick={() => history.push(Routes.LOGIN)}>
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
            onClick={() => console.log("EthStats Dashboard clicked")}>
            EthStats Dashboard
          </Button>
          <Button className={classes.button}
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => console.log("Remix IDE")}>
            Remix IDE
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Welcome;

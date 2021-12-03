import { Box, Button, Divider, FormControl, InputLabel, ListItem, ListItemText, makeStyles, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/Store";
import './Timer.css'
import axios from "axios";
import Endpoints from "../constants/Endpoints";
import Chip from '@material-ui/core/Chip';

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
    width: "100%",
  },
  textbox: {
    marginTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginRight: theme.spacing(5)
  },
  marginTop2: {
    marginTop: theme.spacing(2),
  },
  marginTop4: {
    marginTop: theme.spacing(4),
  },
  formLabel: {
    padding: "0 10px",
    background: "white",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 230,
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(5)
  },
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  green: {
    color: "#109cf1",
  },
}));

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

// let element = <FontAwesomeIcon icon={faClock} />

const DashboardHome: React.FunctionComponent = () => {
  const [time, setTime] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [responseData, setresponseData] = useState({ ratePerMin: 0, currency: "", startTime: "", endTime: "", Total: 0 });

  let [data, setData] = useState({ ratePerMin: 0, currency: "" })
  const classes = useStyles();

  useEffect(() => {
    let interval: any = null;

    if (timerOn) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!timerOn) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerOn]);

  const startTimerApi = () => {
    let email = localStorage.getItem('email')
    const endpoint = `${Endpoints.HOST}${Endpoints.TIMER}`;
    setShowResult(false)
    let timerdata = {
      email,
      "type": "START",
      ratePerMin: data.ratePerMin,
      currency: data.currency,
    }
    axios.post(endpoint, timerdata).then(res => {
      console.log(res);
      startTimer();
    })
      .catch(err => console.log(err))
  }

  const stopTimerApi = () => {
    let email = localStorage.getItem('email')
    const endpoint = `${Endpoints.HOST}${Endpoints.TIMER}`;
    let timerdata = {
      email,
      "type": "STOP",
    }
    axios.post(endpoint, timerdata).then(res => {
      setresponseData({ ...res.data, startTime: new Date(res.data.startTime).toLocaleDateString(), endTime: new Date(res.data.endTime).toLocaleDateString() });
      console.log(responseData);

      stopTimer();
      setShowResult(true)
    })
      .catch(err => console.log(err))
  }

  const handleChange = (e: any) => {
    console.log(e);

  }

  const startTimer = () => {
    setTimerOn(true)
  }

  const stopTimer = () => {
    setTimerOn(false)
  }

  return (
    <div className="Timers">
      <h2>PAYMENT</h2>
      <div className="payment-box">
        <TextField
          className={`${classes.textbox} ${classes.marginTop4}`}
          variant="outlined"
          label="Rate/min"
          placeholder="Rate/min"
          type="number"
          onChange={e => setData({ ...data, ratePerMin: +(e.target.value) })}
        />

        <FormControl className={classes.formControl}>
          <InputLabel id="demo-simple-select-label">Currency</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={data.currency || ""}
            onChange={e => setData({ ...data, currency: (e.target.value) })}
          >
            <MenuItem value={"INR"}>INR</MenuItem>
            <MenuItem value={"USD"}>USD</MenuItem>
            <MenuItem value={"EUR"}>EURO</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className="full-withradius border">
        <div id="display">
          <span>{("0" + Math.floor((time / 60000) % 60)).slice(-2)}:</span>
          <span>{("0" + Math.floor((time / 1000) % 60)).slice(-2)}:</span>
          <span>{("0" + ((time / 10) % 100)).slice(-2)}</span>
        </div>

        <div id="buttons">
          {!timerOn && time === 0 && (
            <button onClick={() => startTimerApi()}>Start</button>
          )}
          {timerOn && <button onClick={() => stopTimerApi()}>Stop</button>}
          {!timerOn && time > 0 && (
            <button onClick={() => setTime(0)}>Reset</button>
          )}
          {!timerOn && time > 0 && (
            <button onClick={() => setTimerOn(true)}>Resume</button>
          )}
        </div>
      </div>

      <div className="info-details">
        {
          showResult ? (
            <>
              <Typography component={'span'} className={classes.marginTop2}>
                <span className={classes.green}>Rate Per Minute:</span> <Chip label={`${responseData.ratePerMin}`} variant="outlined" />
              </Typography>
              <Typography component={'span'} className={classes.marginTop2}>
                <span className={classes.green}>Currency:</span> <Chip label={`${responseData.currency}`} variant="outlined" />
              </Typography>
              <Typography component={'span'} className={classes.marginTop2}>
                <span className={classes.green}>Start Time:</span>  <Chip label={responseData.startTime} variant="outlined" />
              </Typography>
              <Typography component={'span'} className={classes.marginTop2}>
                <span className={classes.green}>End Time:</span>  <Chip label={responseData.endTime} variant="outlined" />
              </Typography>
              <Typography component={'span'} className={classes.marginTop2}>
                <span className={classes.green}>Total: </span> <Chip label={responseData.Total} variant="outlined" />
              </Typography>

              <div className={classes.root}>




              </div>
            </>
          ) : ""
        }

      </div>
    </div>
  );
};


export default DashboardHome;

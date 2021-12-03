import React from "react";
import { Container, makeStyles, Typography } from "@material-ui/core";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import "../App.css";

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    textAlign: "center",
  },
  subHeading: {
    textAlign: "center",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  email: {
    fontWeight: "bold",
  },
}));

const LoginVerification: React.FunctionComponent = () => {
  const classes = useStyles();
  const location = useLocation();
  const parsedQuery = queryString.parse(location.search);

  return (
    <Container className={classes.rootContainer}>
      <Typography className={classes.heading} variant="h4">
        Login Link Sent
      </Typography>
      <Typography className={classes.subHeading}>
        An email has been sent to <span className={classes.email}>{parsedQuery.email}</span>
      </Typography>
      <Typography>
        Please check your spam folder if you don’t see this email in your inbox.
      </Typography>
    </Container>
  );
};

export default LoginVerification;

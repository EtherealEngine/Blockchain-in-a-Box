import React from "react";
import {
  CircularProgress,
  Container,
  makeStyles,
  Typography,
} from "@material-ui/core";
import "../App.css";

interface LoadingViewProps {
  /**
   * Target to display.
   */
  loadingText?: string;
}

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
  },
}));

const LoadingView: React.FunctionComponent<LoadingViewProps> = (
  props: LoadingViewProps
) => {
  const { loadingText } = props;
  const classes = useStyles();

  return (
    <Container className={classes.rootContainer}>
      <CircularProgress />
      {loadingText && <Typography variant="body2" className={classes.loadingText}>
        { loadingText }
      </Typography>}
    </Container>
  );
};

export default LoadingView;

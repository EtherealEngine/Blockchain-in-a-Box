/* eslint-disable react/require-default-props */
import { Box, Button, makeStyles, Typography } from "@material-ui/core";
import React from "react";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    color: "red",
    fontSize: 50,
  },
  message: {
    margin: theme.spacing(2, 0),
    textAlign: "center",
  },
  lightColor: {
    color: "rgba(0, 0, 0, 0.54)",
  },
}));

type RetryCallback = () => void;

interface ErrorViewProps {
  /**
   * Set true if list is in light mode.
   */
  light?: boolean;
  /**
   * Error message to display.
   */
  error: string;
  /**
   * Callback on retry button click.
   */
  onRetry?: RetryCallback;
  /**
   * Retry message to display.
   */
  retryMessage?: string;
}

const ErrorView: React.FunctionComponent<ErrorViewProps> = (
  props: ErrorViewProps
) => {
  const classes = useStyles();
  const { error, onRetry, light, retryMessage } = props;

  return (
    <Box className={classes.root}>
      <ErrorOutlineIcon className={classes.icon} />
      <Typography
        className={
          light ? `${classes.message} ${classes.lightColor}` : classes.message
        }
      >
        {error}
      </Typography>
      {onRetry && (
        <Button color="primary" variant="outlined" onClick={onRetry}>
          {retryMessage ? retryMessage : "Retry"}
        </Button>
      )}
    </Box>
  );
};

export default ErrorView;

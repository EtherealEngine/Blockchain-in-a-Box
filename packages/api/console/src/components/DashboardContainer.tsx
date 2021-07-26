import React from "react";
import { Box, makeStyles } from "@material-ui/core";
import NavigationPanel from "./NavigationPanel";
import "../App.css";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
}));

const DashboardContainer: React.FunctionComponent = ({ children }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <NavigationPanel />
      {children}
    </Box>
  );
};

export default DashboardContainer;

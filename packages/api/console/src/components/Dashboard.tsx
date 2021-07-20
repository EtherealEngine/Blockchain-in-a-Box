import React from "react";
import Deployer from "./Deployer";
import { Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import Routes from "../constants/Routes";
import "../App.css";

const Dashboard: React.FunctionComponent = () => {
  const history = useHistory();
  return (
    <div>
      <Button onClick={() => history.push(Routes.LOGIN)}>Login</Button>
      <br />
      Deployer is here as example, to use later
      <Deployer target="deploy-dev" />
    </div>
  );
};

export default Dashboard;

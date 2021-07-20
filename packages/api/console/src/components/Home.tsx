import React from "react";
import Deployer from "./Deployer";
import { Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import Routes from "../constants/Routes";
import "../App.css";

const Home: React.FunctionComponent = () => {
  const history = useHistory();
  return (
    <div className="home-page">
      <Button onClick={() => history.push(Routes.REGISTER)}>Register</Button>
      <Button onClick={() => history.push(Routes.LOGIN)}>Login</Button>
      <br />
      Deployer is here as example, to use later
      <Deployer target="deploy-dev" />
    </div>
  );
};

export default Home;

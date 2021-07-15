import React from 'react';
import Deployer from "./Deployer"
import './App.css'
import Button from '@material-ui/core/Button';

import {
  HeaderBar,
  LinkButtons,
  loginButton,
  registerButton,
} from '.';

const title = {
  pageTitle: 'Home Screen',
};

const Home = () => (
  <div className="home-page">
    <HeaderBar title={title} />
    <LinkButtons
      buttonText="Register"
      buttonStyle={registerButton}
      link="/register"
    />
    <LinkButtons buttonText="Login" buttonStyle={loginButton} link="/login" />
    <br/>
    Deployer is here as example, to use later
    <Deployer
    target="deploy-dev"
    />


  </div>
);

export default Home;

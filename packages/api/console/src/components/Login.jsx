/* eslint-disable no-console */
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { TextField, Grid } from '@material-ui/core';
import axios from 'axios';
import {
  LinkButtons,
  SubmitButtons,
  registerButton,
  homeButton,
  loginButton,
  forgotButton,
  inputStyle,
} from '../components';

class Login extends Component {
  constructor() {
    super();

    this.state = {
      username: '',
      password: '',
      loggedIn: false,
      showError: false,
      showNullError: false,
    };
  }

  handleChange = name => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  loginUser = async (e) => {
    e.preventDefault();
    const { username, password } = this.state;
    if (username === '' || password === '') {
      this.setState({
        showError: false,
        showNullError: true,
        loggedIn: false,
      });
    } else {
      try {
        const response = await axios.post('http://localhost:3003/loginUser', {
          username,
          password,
        });
        localStorage.setItem('JWT', response.data.token);
        this.setState({
          loggedIn: true,
          showError: false,
          showNullError: false,
        });
      } catch (error) {
        console.error(error.response.data);
        if (
          error.response.data === 'bad username'
          || error.response.data === 'passwords do not match'
        ) {
          this.setState({
            showError: true,
            showNullError: false,
          });
        }
      }
    }
  };

  render() {
    const {
      username,
      password,
      showError,
      loggedIn,
      showNullError,
    } = this.state;
    if (!loggedIn) {
      return (
        <Grid container justifyContent="center" >
          <Grid item>
            <form className="profile-form" onSubmit={this.loginUser}>
              <TextField
                style={inputStyle}
                id="username"
                label="username"
                value={username}
                onChange={this.handleChange('username')}
                placeholder="Username"
              />
              <TextField
                style={inputStyle}
                id="password"
                label="password"
                value={password}
                onChange={this.handleChange('password')}
                placeholder="Password"
                type="password"
              />
              <SubmitButtons buttonStyle={loginButton} buttonText="Login" />
            </form>
            {showNullError && (
              <div>
                <p>The username or password cannot be null.</p>
              </div>
            )}
            {showError && (
              <div>
                <p>
                  That username or password isn&apos;t recognized. Please try
                  again or register now.
                </p>
                <LinkButtons
                  buttonText="Register"
                  buttonStyle={registerButton}
                  link="/register"
                />
              </div>
            )}
            <LinkButtons buttonText="Go Home" buttonStyle={homeButton} link="/" />
            <LinkButtons
              buttonStyle={forgotButton}
              buttonText="Forgot Password?"
              link="/forgotPassword"
            />
          </Grid>
        </Grid>
      );
    }
    return <Redirect to={`/userProfile/${username}`} />;
  }
}

export default Login;

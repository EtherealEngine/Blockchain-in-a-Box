import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Typography,
} from "@material-ui/core";
import {
  Dashboard,
  Person,
  Security,
  Tune,
  Storage,
} from "@material-ui/icons";
import React, { Fragment, ReactElement } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Routes from "../constants/Routes";
import "../App.css";
import { useSelector } from "react-redux";
import { RootState } from "../redux/Store";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  // necessary for content to be below app bar
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  organization: {
    padding: 20,
    color: "#109CF1",
  },
  email: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  userOption: {
    paddingLeft: 30,
  },
}));

interface MenuItem {
  key: string;
  label: string;
  icon: ReactElement;
  link: string;
}

const NavigationPanel: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const { email, organizationName } = useSelector(
    (state: RootState) => state.admin
  );

  const navigationOptions: MenuItem[] = [
    {
      key: "n1",
      label: "Dashboard",
      icon: <Dashboard />,
      link: Routes.DASHBOARD_HOME,
    },
    {
      key: "n2",
      label: "Users",
      icon: <Person />,
      link: Routes.DASHBOARD_USERS,
    },
    {
      key: "n3",
      label: "Secrets & Security",
      icon: <Security />,
      link: Routes.DASHBOARD_SECURITY,
    },
    {
      key: "n4",
      label: "Configuration",
      icon: <Tune />,
      link: Routes.DASHBOARD_CONFIGURATION,
    },
    {
      key: "n5",
      label: "Deployments",
      icon: <Storage />,
      link: Routes.DASHBOARD_DEPLOYMENT,
    },
    {
      key: "n6",
      label: "Realtime Payment",
      icon: <Storage />,
      link: Routes.TIMER,
    },
  ];

  const userOptions: MenuItem[] = [
    {
      key: "u1",
      label: "Logout",
      icon: <Fragment />,
      link: Routes.ROOT,
    },
  ];

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >
      <Typography className={classes.organization} variant="h5" gutterBottom>
        {organizationName}
      </Typography>

      <List>
        {navigationOptions.map((option, index) => (
          <ListItem
            button
            key={option.key}
            selected={location.pathname === option.link}
            onClick={() => history.push(option.link)}
          >
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText primary={option.label} />
          </ListItem>
        ))}
      </List>

      <Typography className={classes.email}>{email}</Typography>

      <List>
        {userOptions.map((option, index) => (
          <ListItem
            button
            key={option.key}
            selected={location.pathname === option.link}
            onClick={() => history.push(option.link)}
          >
            <ListItemText
              className={classes.userOption}
              primary={option.label}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default NavigationPanel;

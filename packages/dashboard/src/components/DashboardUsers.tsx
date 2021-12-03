import {
  Box,
  Button,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from "@material-ui/core";
import React, { useEffect } from "react";
import "../App.css";
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { grey } from "@material-ui/core/colors";
import { useDispatch, useSelector } from "react-redux";
import { addUserDetails, getUserList } from "../redux/slice/DashboardReducer";
import { RootState } from "../redux/Store";
import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles((theme) => ({
  rootBox: {
    padding: theme.spacing(8),
  },
  table: {
    minWidth: 650,
  },
  button: {
    width: 300,
    marginBottom: theme.spacing(8),
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    // border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5, 5, 5),
  },
  textbox: {
    marginTop: theme.spacing(2),
  },
  parentBox: {
    marginBottom: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    maxWidth: 500,
  },
  buttonSubmit: {
    marginTop: theme.spacing(3),
  },
  paperTxt: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    background: "grey"
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 130,
  }
}));



const DashboardUsers: React.FunctionComponent = () => {
  const classes = useStyles();
  const reduxDispatch = useDispatch();

  const { userDataLoading, userSavedSuccesssfully, userList } = useSelector((state: RootState) => state.dashboard)

  const [open, setOpen] = React.useState(false);

  const [userData, setUserData] = React.useState(
    { userEmail: "", username: "", firstName: "", lastName: "", password: "", userRole: "user" }
  );

  useEffect(() => {
    reduxDispatch(getUserList())
  }, [])

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (userSavedSuccesssfully && open) {
      handleClose()
      reduxDispatch(getUserList())
    }
  }, [userSavedSuccesssfully])

  useEffect(() => {
    reduxDispatch(getUserList())
  }, []);

  const saveUserData = e => {
    reduxDispatch(addUserDetails(userData))
  }

  const renderUserTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>User Name</TableCell>
              <TableCell>Role</TableCell>
              {/* <TableCell>Action</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {userList && userList.map((row: any, index) => (
              <TableRow key={index}>

                <TableCell>{row.userEmail}</TableCell>
                <TableCell>{row.firstName}</TableCell>
                <TableCell>{row.lastName}</TableCell>
                <TableCell>{row.username}</TableCell>
                <TableCell>{row.userRole}</TableCell>
                {/* <TableCell>
                <EditIcon />
              </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }



  return (
    <Box className={classes.rootBox}>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
        onClick={handleOpen}
      >
        Add User
      </Button>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={classes.paper}>
            <Grid container justifyContent="center">
              <Grid className={classes.parentBox} item>
                <Grid item xs>
                  <Paper className={classes.paperTxt}>Add User</Paper>
                </Grid>
                <TextField
                  className={classes.textbox}
                  variant="outlined"
                  label="User Name"
                  placeholder="Enter user name"
                  required
                  fullWidth
                  style={{ width: 400 }}
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                />

                <TextField
                  className={classes.textbox}
                  variant="outlined"
                  label="Email"
                  placeholder="Enter user email"
                  required
                  fullWidth
                  style={{ width: 400 }}
                  onChange={(e) => setUserData({ ...userData, userEmail: e.target.value })}
                />

                <TextField
                  className={classes.textbox}
                  variant="outlined"
                  label="First Name"
                  placeholder="Enter user First Name"
                  required
                  fullWidth
                  style={{ width: 400 }}
                  onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                />

                <TextField
                  className={classes.textbox}
                  variant="outlined"
                  label="Last Name"
                  placeholder="Enter user Last Name"
                  required
                  fullWidth
                  style={{ width: 400 }}
                  onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                />

                <TextField
                  className={classes.textbox}
                  variant="outlined"
                  label="Password"
                  placeholder="Enter user Password"
                  required
                  fullWidth
                  style={{ width: 400 }}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                />


                <FormControl className={classes.formControl}>
                  <InputLabel id="demo-simple-select-label">Role</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={userData.userRole}
                    onChange={(e) => setUserData({ ...userData, userRole: e.target.value })}
                  >
                    <MenuItem value={"user"}>User</MenuItem>
                    <MenuItem value={"admin"}>Admin</MenuItem>
                  </Select>
                </FormControl>


                <Button
                  className={classes.buttonSubmit}
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={saveUserData}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>

          </div>
        </Fade>
      </Modal>

      {
        renderUserTable()
      }

    </Box>
  );
};

export default DashboardUsers;

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
  Grid
} from "@material-ui/core";
import React from "react";
import "../App.css";
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { grey } from "@material-ui/core/colors";

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
    padding: theme.spacing(10, 15, 15),
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
}));



const DashboardUsers: React.FunctionComponent = () => {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


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
                />

                <TextField
                  className={classes.textbox}
                  variant="outlined"
                  label="Email"
                  placeholder="Enter user email"
                  required
                  fullWidth
                  style={{ width: 400 }}
                />

                <TextField
                  className={classes.textbox}
                  variant="outlined"
                  label="Role"
                  placeholder="Enter user role"
                  required
                  fullWidth
                  style={{ width: 400 }}
                />

                <Button
                  className={classes.buttonSubmit}
                  variant="contained"
                  color="primary"
                  size="large"

                >
                  Submit
                </Button>
              </Grid>
            </Grid>

          </div>
        </Fade>
      </Modal>

      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array(8)
              .fill(0)
              .map((row, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    user{index}@gmail.com
                  </TableCell>
                  <TableCell>Role {index}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DashboardUsers;

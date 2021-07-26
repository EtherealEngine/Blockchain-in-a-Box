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
} from "@material-ui/core";
import React from "react";
import "../App.css";

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
}));

const DashboardUsers: React.FunctionComponent = () => {
  const classes = useStyles();

  return (
    <Box className={classes.rootBox}>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="large"
      >
        Add User
      </Button>

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

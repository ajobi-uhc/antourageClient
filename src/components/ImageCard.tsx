import * as React from "react";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect, useState, useCallback } from "react";
import { CircularProgress } from "@material-ui/core";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

import AttributeCardGrid from "./AttributeCardgrid";

interface attributeFace {
  trait_type: string;
  value: string;
}

export default function LeaderCard(props: any) {
  const handlePlay = async () => {
    console.log("You clicked play on ", props.handle);
    console.log("weeeird wallet", props.wallet);
    console.log("eve weirded", props.handle)
    let tx = await props.onPlay(props.handle);
    console.log("finished");
  };

  // const font = "Lato";
  const classes = useStyles();

  return (
    <div>
      <Card
        style={{ backgroundColor: "none" }}
        sx={{
          borderRadius: "5px",
          border: "2px whitesmoke",
          borderColor: "none",
          padding: "5px",
        }}
        className={classes.root}
      >
        <Button onClick={handlePlay}> Play </Button>

        <Typography className={classes.typo}> golf ball </Typography>
      </Card>
    </div>
  );
}

const useStyles = makeStyles({
  root: {
    backgroundColor: "#242424",
    padding: "10px",
    fontFamily: "Lato",
    color: "white",
    width: "400px",
    minHeight: "1120px",
  },
  image: {
    marginLeft: "10px",
    marginTop: "10px",
  },
  typo: {
    textAlign: "justify",
    fontFamily: "proxima nova, sans-serif",
    color: "#827F7F",
    fontSize: "24px",
    paddingLeft: "2%",
    marginTop: "5%",
    fontWeight: "100",
  },
  description: {
    color: "white",
    maxWidth: "380px",
    marginLeft: "2%",
    fontSize: "15px",
    textAlign: "justify",
    fontFamily: "proxima nova, sans-serif",
    fontWeight: "100",
    marginBottom: "6%",
    letterSpacing: "1px",
    height: "280px",
  },
  button: {
    backgroundColor: "#242424",
    color: "white",
    // marginLeft:"30%",
    // textAlign: "justify",
    width: "100%",
    fontSize: "20px",
  },
  button1: {
    backgroundColor: "#242424",
    color: "white",
    padding: "5px",
    fontSize: "20px",
    fontFamily: "proxima nova, sans-serif",
    left: " 2% !important",
  },
});

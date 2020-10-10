import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

import style from "./index.module.css";

import closeIcon from "../assets/close.svg";

const useStyles = makeStyles(() => ({
  formControl: {
    minWidth: 120,
    marginLeft: 20,
  },
  closeButton: {
    position: "absolute",
    right: 8,
    top: 8,
  },
}));

const time = Array(24).fill(1);

function getTime(num) {
  if (num === 0 || num === 12) {
    return num === 0 ? "12:00 AM" : "12:00 PM";
  }
  return num > 12 ? `${num - 12}:00 PM` : `${num}:00 AM`;
}

function getMenuItems() {
  return time.map((_, i) => {
    const value = getTime(i);
    return (
      <MenuItem value={i} key={value}>
        {value}
      </MenuItem>
    );
  });
}

function PreviewDialog({ open, onClose, onSave, onDelete, scheduleData }) {
  const classes = useStyles();
  const [scheduleForm, setScheduleForm] = useState({
    scheduleData,
  });

  useEffect(() => {
    const isEmpty = Object.keys(scheduleData).length === 0;
    setScheduleForm({
      start: isEmpty ? 0 : dayjs(scheduleData["start"]).get("hour"),
      end: isEmpty ? 0 : dayjs(scheduleData["end"]).get("hour"),
      repeatForTwoWeeks: isEmpty ? false : scheduleData["repeatForTwoWeeks"],
      noCost: isEmpty ? false : scheduleData["noCost"],
      disabled: isEmpty
        ? false
        : scheduleData["status"] === "booked" ||
          scheduleData["status"] === "booked-inactive"
        ? true
        : false,
      scheduleData,
    });
  }, [scheduleData]);

  const {
    start = 0,
    end = 0,
    repeatForTwoWeeks = false,
    noCost = false,
    disabled = false,
  } = scheduleForm;

  function handleTimeChange(event) {
    setScheduleForm({
      ...scheduleForm,
      [event.target.name]: event.target.value,
    });
  }

  function handleCheckboxChange(event, checked) {
    setScheduleForm({ ...scheduleForm, [event.target.name]: checked });
  }

  function handleDelete() {
    onDelete(scheduleData["start"], scheduleData["end"]);
  }

  function handleSave() {
    onSave({
      start: dayjs(scheduleData["start"]).set("hour", start).toISOString(),
      end: dayjs(scheduleData["start"]).set("hour", end).toISOString(),
      repeatForTwoWeeks,
      noCost,
    });
  }

  return (
    <Dialog maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle>
        Schedule time period
        <IconButton className={classes.closeButton} onClick={onClose}>
          <img src={closeIcon} alt="close" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div>
          {!disabled
            ? "Schedule your availability for as far as two weeks from now."
            : "You are booked for the selected time period."}
        </div>
        <div className={style.selectContainer}>
          <div className={style.selectLabel}>Start time:</div>
          <div>
            <FormControl className={classes.formControl} disabled={disabled}>
              <Select name="start" value={start} onChange={handleTimeChange}>
                {getMenuItems()}
              </Select>
            </FormControl>
          </div>
        </div>
        <div className={style.selectContainer}>
          <div className={style.selectLabel}>End time:</div>
          <div>
            <FormControl className={classes.formControl} disabled={disabled}>
              <Select name="end" value={end} onChange={handleTimeChange}>
                {getMenuItems()}
              </Select>
            </FormControl>
          </div>
        </div>
        <div>
          <FormControlLabel
            disabled={disabled}
            control={
              <Checkbox
                checked={repeatForTwoWeeks}
                onChange={handleCheckboxChange}
                name="repeatForTwoWeeks"
              />
            }
            label="Repeat for next two weeks"
          />
        </div>
        <div>
          <FormControlLabel
            disabled={disabled}
            color="primary"
            control={
              <Checkbox
                checked={noCost}
                onChange={handleCheckboxChange}
                name="noCost"
              />
            }
            label="No cost"
          />
        </div>
      </DialogContent>
      <DialogActions>
        {!disabled ? (
          <>
            <Button onClick={handleDelete} variant="text" color="primary">
              DELETE
            </Button>
            <Button onClick={handleSave} variant="text" color="primary">
              SAVE
            </Button>
          </>
        ) : (
          <Button onClick={onClose} variant="text" color="primary">
            OK
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default PreviewDialog;

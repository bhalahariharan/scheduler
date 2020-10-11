import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Button from "@material-ui/core/Button";
import PreviewDialog from "./PreviewDialog";
import style from "./index.module.css";

import {
  DAYS,
  DEFAULT_ACTIVE_HOURS,
  INACTIVE_HOURS,
  STATUS,
} from "../shared/constants";
import {
  getBackgroundColor,
  getDates,
  getTime,
  getUpdatedSchedule,
  getSavedData,
  saveToLocalStorage,
  clearSchedule,
  deleteSelectedSchedule,
} from "../shared/utils";

const initialSchedule = Array(24)
  .fill(1)
  .map(() => new Array(DAYS.length).fill(false));

function Scheduler() {
  const [scheduleState, setScheduleState] = useState({
    schedule: initialSchedule,
    openDialog: false,
  });
  const { schedule, openDialog, scheduleData = {} } = scheduleState;

  function onCellClick(event) {
    let [i, j] = event.target.id.split(",");
    i = Number(i);
    j = Number(j);

    if (
      [
        STATUS.SELECTED,
        STATUS.INACTIVE,
        STATUS.BOOKED,
        STATUS.BOOKED_INACTIVE,
      ].includes(
        typeof schedule[i][j] === "object" ? schedule[i][j]["status"] : ""
      )
    ) {
      setScheduleState({
        ...scheduleState,
        scheduleData: schedule[i][j],
        openDialog: true,
      });
      return;
    }

    if (
      i < INACTIVE_HOURS ||
      i > 23 - (INACTIVE_HOURS + DEFAULT_ACTIVE_HOURS)
    ) {
      alert(
        `Slot can be selected between ${INACTIVE_HOURS} am and ${
          23 - (INACTIVE_HOURS + DEFAULT_ACTIVE_HOURS) - 12
        } pm`
      );
      return;
    }

    const copiedSchedule = [...schedule];
    const startOfDate = dayjs().startOf("date");
    const start = startOfDate.add(j, "day").add(i, "hour").toISOString();
    const end = startOfDate
      .add(j, "day")
      .add(i + 3, "hour")
      .toISOString();
    const data = { status: STATUS.SELECTED, start, end };
    copiedSchedule[i][j] = data;
    for (let index = 1; index <= DEFAULT_ACTIVE_HOURS; index++) {
      copiedSchedule[i + index][j] = data;
    }
    for (let index = 1; index <= INACTIVE_HOURS; index++) {
      copiedSchedule[i - index][j] = { ...data, status: STATUS.INACTIVE };
      copiedSchedule[i + index + DEFAULT_ACTIVE_HOURS][j] = {
        ...data,
        status: STATUS.INACTIVE,
      };
    }

    setScheduleState({
      ...scheduleState,
      schedule: copiedSchedule,
      scheduleData: false,
    });
  }

  function onDialogClose() {
    setScheduleState({
      ...scheduleState,
      openDialog: false,
      scheduleData: false,
    });
  }

  function onDelete(start, end) {
    const updatedSchedule = deleteSelectedSchedule(start, end, schedule);
    setScheduleState({
      ...scheduleState,
      openDialog: false,
      scheduleData: false,
      schedule: updatedSchedule,
    });
  }

  function onSave(data, prevStartDate, prevEndDate) {
    saveToLocalStorage(data);
    const updatedSchedule = getUpdatedSchedule(
      data,
      deleteSelectedSchedule(prevStartDate, prevEndDate, schedule)
    );
    setScheduleState({
      ...scheduleState,
      openDialog: false,
      scheduleData: false,
      schedule: updatedSchedule,
    });
  }

  function loadData() {
    const savedData = getSavedData();
    if (savedData === null) {
      setScheduleState({
        ...scheduleState,
        openDialog: false,
        scheduleData: false,
        schedule: initialSchedule,
      });
      return;
    }
    const updatedSchedule = getUpdatedSchedule(savedData, schedule);
    setScheduleState({
      ...scheduleState,
      openDialog: false,
      scheduleData: false,
      schedule: updatedSchedule,
    });
  }

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line

  return (
    <>
      <div className={style.title}>
        <h2>Select a new schedule</h2>
        <div>{dayjs().format("MMMM, YYYY")}</div>
      </div>
      <PreviewDialog
        open={openDialog}
        onClose={onDialogClose}
        onDelete={onDelete}
        onSave={onSave}
        scheduleData={scheduleData}
      />
      <div>
        <table className={style.scheduleTable}>
          <thead>
            <tr>
              <th></th>
              {DAYS.map((day) => (
                <th className={style.cell} key={day}>
                  {day.slice(0, 1)}
                </th>
              ))}
            </tr>
            <tr className={style.date}>
              <th></th>
              {getDates().map((d) => (
                <th key={`date-${d}`} className={style.cell}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.map((r, i) => {
              return (
                <tr key={`row-${i}`}>
                  {[
                    <td key={`time-${i}`}>{getTime(i)}</td>,
                    ...r.map((c, j) => {
                      return (
                        <td
                          key={`${i},${j}`}
                          id={`${i},${j}`}
                          onClick={onCellClick}
                          className={style.cell}
                          style={{
                            backgroundColor: getBackgroundColor(c),
                          }}
                        ></td>
                      );
                    }),
                  ]}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={style.actionButtons}>
        <Button color="primary" variant="outlined" onClick={clearSchedule}>
          Clear Schedule
        </Button>
      </div>
    </>
  );
}

export default Scheduler;

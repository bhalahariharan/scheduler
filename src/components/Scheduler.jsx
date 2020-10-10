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
import { getBackgroundColor, getDates, getTime } from "../shared/utils";

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
    let [startDay, startHour] = dayjs(start).format("D,H").split(",");
    const endHour = dayjs(end).get("hour");
    startDay = Number(startDay) - dayjs().startOf("date").get("date");
    startHour = Number(startHour);
    const copiedSchedule = [...schedule];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          j === startDay &&
          i >= startHour - INACTIVE_HOURS &&
          i <= endHour + INACTIVE_HOURS
        ) {
          copiedSchedule[i][j] = false;
        }
      }
    }
    setScheduleState({
      ...scheduleState,
      openDialog: false,
      scheduleData: false,
      schedule: copiedSchedule,
    });
  }

  function onSave(data) {
    let savedData = localStorage.getItem("bookedSlots");
    if (savedData === null) {
      localStorage.setItem("bookedSlots", JSON.stringify([data]));
    } else {
      savedData = [data, ...JSON.parse(savedData)];
      localStorage.setItem("bookedSlots", JSON.stringify(savedData));
    }
    let [startDay, startHour] = dayjs(data.start).format("D,H").split(",");
    const endHour = dayjs(data.end).get("hour");
    startDay = Number(startDay) - dayjs().startOf("date").get("date");
    startHour = Number(startHour);
    const copiedSchedule = [...schedule];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 7; j++) {
        const slotData = {
          start: data.start,
          end: data.end,
          repeatForTwoWeeks: data.repeatForTwoWeeks,
          noCost: data.noCost,
        };
        if (j === startDay && i >= startHour && i < endHour) {
          copiedSchedule[i][j] = {
            ...slotData,
            status: STATUS.BOOKED,
          };
        }
        if (
          j === startDay &&
          i >= startHour - INACTIVE_HOURS &&
          i < startHour
        ) {
          copiedSchedule[i][j] = {
            ...slotData,
            status: STATUS.BOOKED_INACTIVE,
          };
        }
        if (j === startDay && i >= endHour && i < endHour + INACTIVE_HOURS) {
          copiedSchedule[i][j] = {
            ...slotData,
            status: STATUS.BOOKED_INACTIVE,
          };
        }
      }
    }
    setScheduleState({
      ...scheduleState,
      openDialog: false,
      scheduleData: false,
      schedule: copiedSchedule,
    });
  }

  function loadData() {
    let savedData = localStorage.getItem("bookedSlots");
    if (savedData === null) {
      setScheduleState({
        ...scheduleState,
        openDialog: false,
        scheduleData: false,
        schedule: initialSchedule,
      });
      return;
    }
    savedData = JSON.parse(savedData);
    savedData = savedData.filter((s) => {
      const startDate = dayjs(s.start).get("date");
      const startOfDate = dayjs().startOf("date").get("date");
      return startDate - startOfDate >= 0 && startDate - startOfDate <= 6
        ? true
        : false;
    });
    const copiedSchedule = [...schedule];
    for (const slot of savedData) {
      let [startDay, startHour] = dayjs(slot.start).format("D,H").split(",");
      const endHour = dayjs(slot.end).get("hour");
      startDay = Number(startDay) - dayjs().startOf("date").get("date");
      startHour = Number(startHour);
      for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 7; j++) {
          const slotData = {
            start: slot.start,
            end: slot.end,
            repeatForTwoWeeks: slot.repeatForTwoWeeks,
            noCost: slot.noCost,
          };
          if (j === startDay && i >= startHour && i < endHour) {
            copiedSchedule[i][j] = {
              ...slotData,
              status: STATUS.BOOKED,
            };
          }
          if (
            j === startDay &&
            i >= startHour - INACTIVE_HOURS &&
            i < startHour
          ) {
            copiedSchedule[i][j] = {
              ...slotData,
              status: STATUS.BOOKED_INACTIVE,
            };
          }
          if (j === startDay && i >= endHour && i < endHour + INACTIVE_HOURS) {
            copiedSchedule[i][j] = {
              ...slotData,
              status: STATUS.BOOKED_INACTIVE,
            };
          }
        }
      }
    }
    setScheduleState({
      ...scheduleState,
      openDialog: false,
      scheduleData: false,
      schedule: copiedSchedule,
    });
  }

  function clearSchedule() {
    localStorage.clear();
    window.location.reload();
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

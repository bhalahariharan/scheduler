import dayjs from "dayjs";
import { INACTIVE_HOURS, STATUS } from "./constants";

export function getDates() {
  const date = dayjs().get("date");
  return Array(7)
    .fill(0)
    .map((_, i) => date + i);
}

export function getTime(num) {
  if (num === 0 || num === 12) {
    return num === 0 ? "12 a" : "12 p";
  }
  return num > 12 ? num - 12 : num;
}

export function getBackgroundColor(data) {
  if (typeof data === "boolean") {
    return "unset";
  }
  switch (data["status"]) {
    case STATUS.INACTIVE:
      return "#e0e0e0";
    case STATUS.SELECTED:
      return "#01b2ff";
    case STATUS.BOOKED:
      return "#ff0100";
    case STATUS.BOOKED_INACTIVE:
      return "#ff9696";
    default:
      return "unset";
  }
}

export function getUpdatedSchedule(slots, schedule) {
  if (!Array.isArray(slots)) {
    slots = [slots];
  }

  const copiedSchedule = [...schedule];
  for (const slot of slots) {
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

  return copiedSchedule;
}

export function deleteSelectedSchedule(start, end, schedule) {
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

  return copiedSchedule;
}

export function getSavedData() {
  let savedData = localStorage.getItem("bookedSlots");
  if (savedData === null) {
    return null;
  }

  savedData = JSON.parse(savedData);
  return savedData.filter((s) => {
    const startDate = dayjs(s.start).get("date");
    const startOfDate = dayjs().startOf("date").get("date");
    return startDate - startOfDate >= 0 && startDate - startOfDate <= 6
      ? true
      : false;
  });
}

export function saveToLocalStorage(data) {
  let savedData = localStorage.getItem("bookedSlots");
  if (savedData === null) {
    localStorage.setItem("bookedSlots", JSON.stringify([data]));
  } else {
    savedData = [data, ...JSON.parse(savedData)];
    localStorage.setItem("bookedSlots", JSON.stringify(savedData));
  }
}

export function clearSchedule() {
  localStorage.clear();
  window.location.reload();
}

import dayjs from "dayjs";
import { STATUS } from "./constants";

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

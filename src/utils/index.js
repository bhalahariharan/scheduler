import dayjs from "dayjs";

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
    case "inactive":
      return "#e0e0e0";
    case "selected":
      return "#01b2ff";
    case "booked":
      return "#ff0100";
    case "booked-inactive":
      return "#ff9696";
    default:
      return "unset";
  }
}

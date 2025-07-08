import dayjs from "dayjs";
import { ErrorHelper } from "./ErrorHelper";

export class DateHelper {
  static formatHtml5Date(date: Date): string {
    let result = "";
    if (date !== undefined && date !== null) {
      try {
        result = new Date(date).toISOString().split("T")[0];
      } catch (e: unknown) {
        ErrorHelper.logError();
      }
    }
    return result;
  }

  static prettyDate(date: Date) {
    if (date === undefined || date === null) return "";
    return this.formatDateTime(date, "MMM D, YYYY");
  }

  private static formatDateTime(date: Date, format: string) {
    try {
      return dayjs(date).format(format);
    } catch (e: unknown) {
      ErrorHelper.logError();
      return "";
    }
  }

  static getDisplayDuration(d: Date): string {
    let seconds = Math.round((new Date().getTime() - d.getTime()) / 1000);
    if (seconds > 86400) {
      let days = Math.floor(seconds / 86400);
      return days === 1 ? "1d" : days.toString() + "d";
    } else if (seconds > 3600) {
      let hours = Math.floor(seconds / 3600);
      return hours === 1 ? "1h" : hours.toString() + "h";
    } else if (seconds > 60) {
      let minutes = Math.floor(seconds / 60);
      return minutes === 1 ? "1m" : minutes.toString() + "m";
    } else return seconds === 1 ? "1s" : Math.floor(seconds).toString() + "s";
  }
}

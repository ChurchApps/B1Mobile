import dayjs from "./dayjsConfig";
import { ErrorHelper } from "./ErrorHelper";

export class DateHelper {
  static formatHtml5Date(date: Date): string {
    let result = "";
    if (date !== undefined && date !== null) {
      try {
        result = new Date(date).toISOString().split("T")[0];
      } catch (e) {
        ErrorHelper.logError("DateHelper", "formatHtml5Date: " + String(e));
      }
    }
    return result;
  }

  // Localized short date format: "Dec 30, 2025" (en) or "30 déc. 2025" (fr)
  static prettyDate(date: Date) {
    if (date === undefined || date === null) return "";
    try {
      return dayjs(date).format("ll");
    } catch (e) {
      ErrorHelper.logError("DateHelper", "prettyDate: " + String(e));
      return "";
    }
  }

  // Localized date with time: "Dec 30, 2025 2:30 PM" (en) or "30 déc. 2025 14:30" (fr)
  static prettyDateTime(date: Date) {
    if (date === undefined || date === null) return "";
    try {
      return dayjs(date).format("lll");
    } catch (e) {
      ErrorHelper.logError("DateHelper", "prettyDateTime: " + String(e));
      return "";
    }
  }

  // Localized time: "2:30 PM" (en) or "14:30" (fr)
  static prettyTime(date: Date) {
    if (date === undefined || date === null) return "";
    try {
      return dayjs(date).format("LT");
    } catch (e) {
      ErrorHelper.logError("DateHelper", "prettyTime: " + String(e));
      return "";
    }
  }

  // Localized full date: "December 30, 2025" (en) or "30 décembre 2025" (fr)
  static prettyFullDate(date: Date) {
    if (date === undefined || date === null) return "";
    try {
      return dayjs(date).format("LL");
    } catch (e) {
      ErrorHelper.logError("DateHelper", "prettyFullDate: " + String(e));
      return "";
    }
  }

  // Localized relative time: "2 hours ago" (en) or "il y a 2 heures" (fr)
  static relativeTime(date: Date) {
    if (date === undefined || date === null) return "";
    try {
      return dayjs(date).fromNow();
    } catch (e) {
      ErrorHelper.logError("DateHelper", "relativeTime: " + String(e));
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

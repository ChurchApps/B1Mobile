import dayjs from "./dayjsConfig";
import { ErrorHelper } from "./ErrorHelper";

export class DateHelper {
  //Fixes timezone issues when you just need the date.
  static toDate(input: any) {
    const str = input.toString();
    const dateOnlyMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
    }
    return new Date(Date.parse(str.replace("Z", "")));
  }

  static formatHtml5Date(date: Date | string | null | undefined): string {
    if (!date) return "";

    // If already a YYYY-MM-DD string, return as-is
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

    // If ISO string, extract date portion (ignore timezone)
    if (typeof date === "string") {
      const match = date.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }

    // For Date objects, use LOCAL year/month/day (not UTC)
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return "";

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      ErrorHelper.logError("DateHelper", "formatHtml5Date: " + String(e));
      return "";
    }
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
    const seconds = Math.round((new Date().getTime() - d.getTime()) / 1000);
    if (seconds > 86400) {
      const days = Math.floor(seconds / 86400);
      return days === 1 ? "1d" : days.toString() + "d";
    } else if (seconds > 3600) {
      const hours = Math.floor(seconds / 3600);
      return hours === 1 ? "1h" : hours.toString() + "h";
    } else if (seconds > 60) {
      const minutes = Math.floor(seconds / 60);
      return minutes === 1 ? "1m" : minutes.toString() + "m";
    } else return seconds === 1 ? "1s" : Math.floor(seconds).toString() + "s";
  }
}

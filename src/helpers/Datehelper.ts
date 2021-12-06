import { format as dateFormat } from "date-fns";

export class DateHelper {
  static formatHtml5Date(date: Date): string {
    let result = "";
    if (date !== undefined && date !== null) {
      try {
        result = new Date(date).toISOString().split("T")[0];
      } catch {}
    }
    return result;
  }

  static prettyDate(date: Date) {
    if (date === undefined || date === null) return "";
    return this.formatDateTime(date, "MMM d, yyyy");
  }

  private static formatDateTime(date: Date, format: string) {
    try {
      return dateFormat(date, format);
    } catch {
      return "";
    }
  }
}

import { ApiHelper } from "@churchapps/helpers";
import Constants from "expo-constants";

export class EnvironmentHelper {
  public static MembershipApi = "";
  public static MessagingApi = "";
  public static AttendanceApi = "";
  public static GivingApi = "";
  public static ContentApi = "";
  public static LessonsRoot = "";
  public static DoingApi = "";
  public static LessonsApi = "";
  public static B1WebRoot = "";

  static ContentRoot = "";

  static init = () => {
    const extra = Constants.expoConfig?.extra || {};
    const stage = extra.STAGE;

    switch (stage) {
      case "prod": EnvironmentHelper.initProd(); break;
      default: EnvironmentHelper.initDev(); break;
    }

    console.log("[EnvironmentHelper] API URLs configured:");
    console.log("  MembershipApi:", EnvironmentHelper.MembershipApi);
    console.log("  ContentApi:", EnvironmentHelper.ContentApi);
    console.log("  GivingApi:", EnvironmentHelper.GivingApi);

    ApiHelper.apiConfigs = [
      { keyName: "MembershipApi", url: EnvironmentHelper.MembershipApi, jwt: "", permisssions: [] },
      { keyName: "MessagingApi", url: EnvironmentHelper.MessagingApi, jwt: "", permisssions: [] },
      { keyName: "AttendanceApi", url: EnvironmentHelper.AttendanceApi, jwt: "", permisssions: [] },
      { keyName: "GivingApi", url: EnvironmentHelper.GivingApi, jwt: "", permisssions: [] },
      { keyName: "ContentApi", url: EnvironmentHelper.ContentApi, jwt: "", permisssions: [] },
      { keyName: "DoingApi", url: EnvironmentHelper.DoingApi, jwt: "", permisssions: [] },
      { keyName: "LessonsApi", url: EnvironmentHelper.LessonsApi, jwt: "", permisssions: [] }
    ];
  };

  private static applyApiBase = (base: string) => {
    const trimmed = base.replace(/\/$/, "");
    EnvironmentHelper.MembershipApi = trimmed + "/membership";
    EnvironmentHelper.MessagingApi  = trimmed + "/messaging";
    EnvironmentHelper.AttendanceApi = trimmed + "/attendance";
    EnvironmentHelper.GivingApi     = trimmed + "/giving";
    EnvironmentHelper.DoingApi      = trimmed + "/doing";
    EnvironmentHelper.ContentApi    = trimmed + "/content";
  };

  static initDev = () => {
    // Read individual API URLs from app.config.js `extra` (populated from .env at build time).
    // Falls back to staging if a value is missing.
    const extra = Constants.expoConfig?.extra || {};
    EnvironmentHelper.MembershipApi = extra.MEMBERSHIP_API || "https://api.staging.churchapps.org/membership";
    EnvironmentHelper.MessagingApi  = extra.MESSAGING_API  || "https://api.staging.churchapps.org/messaging";
    EnvironmentHelper.AttendanceApi = extra.ATTENDANCE_API || "https://api.staging.churchapps.org/attendance";
    EnvironmentHelper.GivingApi     = extra.GIVING_API     || "https://api.staging.churchapps.org/giving";
    EnvironmentHelper.DoingApi      = extra.DOING_API      || "https://api.staging.churchapps.org/doing";
    EnvironmentHelper.ContentApi    = extra.CONTENT_API    || "https://api.staging.churchapps.org/content";
    EnvironmentHelper.LessonsApi    = extra.LESSONS_API    || "https://api.staging.lessons.church";
    EnvironmentHelper.ContentRoot   = extra.CONTENT_ROOT   || "https://content.staging.churchapps.org";
    EnvironmentHelper.LessonsRoot   = extra.LESSONS_ROOT   || "https://staging.lessons.church";
    EnvironmentHelper.B1WebRoot     = "https://{subdomain}.staging.b1.church";
  };

  // NOTE - None of these values are secret
  static initProd = () => {
    EnvironmentHelper.applyApiBase("https://api.churchapps.org");
    EnvironmentHelper.LessonsApi = "https://api.lessons.church";
    EnvironmentHelper.ContentRoot = "https://content.churchapps.org";
    EnvironmentHelper.LessonsRoot = "https://lessons.church";
    EnvironmentHelper.B1WebRoot = "https://{subdomain}.b1.church";
  };
}

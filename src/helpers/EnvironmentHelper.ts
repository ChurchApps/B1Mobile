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
    let stage = extra.STAGE;

    stage = "prod";
    //stage = "staging";
    console.log("[EnvironmentHelper] Initializing with stage:", stage);
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

  static initDev = () => {
    // Hardcode staging URLs - don't read from extra since app.config.js defaults to prod
    EnvironmentHelper.MembershipApi = "https://api.staging.churchapps.org/membership";
    EnvironmentHelper.MessagingApi = "https://api.staging.churchapps.org/messaging";
    EnvironmentHelper.AttendanceApi = "https://api.staging.churchapps.org/attendance";
    EnvironmentHelper.GivingApi = "https://api.staging.churchapps.org/giving";
    EnvironmentHelper.LessonsApi = "https://api.staging.lessons.church";
    EnvironmentHelper.DoingApi = "https://api.staging.churchapps.org/doing";
    EnvironmentHelper.ContentApi = "https://api.staging.churchapps.org/content";
    EnvironmentHelper.ContentRoot = "https://content.staging.churchapps.org";
    EnvironmentHelper.LessonsRoot = "https://staging.lessons.church";
    EnvironmentHelper.B1WebRoot = "https://{subdomain}.staging.b1.church";
  };

  // NOTE - None of these values are secret
  static initProd = () => {
    EnvironmentHelper.MembershipApi = "https://api.churchapps.org/membership";
    EnvironmentHelper.MessagingApi = "https://api.churchapps.org/messaging";
    EnvironmentHelper.AttendanceApi = "https://api.churchapps.org/attendance";
    EnvironmentHelper.GivingApi = "https://api.churchapps.org/giving";
    EnvironmentHelper.LessonsApi = "https://api.lessons.church";
    EnvironmentHelper.DoingApi = "https://api.churchapps.org/doing";
    EnvironmentHelper.ContentApi = "https://api.churchapps.org/content";
    EnvironmentHelper.ContentRoot = "https://content.churchapps.org";
    EnvironmentHelper.LessonsRoot = "https://lessons.church";
    EnvironmentHelper.B1WebRoot = "https://{subdomain}.b1.church";
  };
}

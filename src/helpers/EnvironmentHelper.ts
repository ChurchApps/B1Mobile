import { ApiHelper } from "../mobilehelper";
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
  public static StreamingLiveRoot = "";
  public static B1WebRoot = "";

  static ContentRoot = "";

  static init = () => {
    const extra = Constants.expoConfig?.extra || {};
    let stage = extra.STAGE;

    stage = "prod";
    //stage = "staging";
    switch (stage) {
      case "prod":
        EnvironmentHelper.initProd();
        break;
      default:
        EnvironmentHelper.initDev();
        break;
    }

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
    const extra = Constants.expoConfig?.extra || {};
    EnvironmentHelper.MembershipApi = extra.MEMBERSHIP_API || "https://membershipapi.staging.churchapps.org";
    EnvironmentHelper.MessagingApi = extra.MESSAGING_API || "https://messagingapi.staging.churchapps.org";
    EnvironmentHelper.AttendanceApi = extra.ATTENDANCE_API || "https://attendanceapi.staging.churchapps.org";
    EnvironmentHelper.GivingApi = extra.GIVING_API || "https://givingapi.staging.churchapps.org";
    EnvironmentHelper.LessonsApi = extra.LESSONS_API || "https://api.staging.lessons.church";
    EnvironmentHelper.DoingApi = extra.DOING_API || "https://doingapi.staging.churchapps.org";
    EnvironmentHelper.ContentApi = extra.CONTENT_API || "https://contentapi.staging.churchapps.org";
    EnvironmentHelper.ContentRoot = extra.CONTENT_ROOT || "https://content.staging.churchapps.org";
    EnvironmentHelper.LessonsRoot = extra.LESSONS_ROOT || "https://staging.lessons.church";
    EnvironmentHelper.StreamingLiveRoot = extra.STREAMING_LIVE_ROOT || "https://{subdomain}.staging.streaminglive.church";
    EnvironmentHelper.B1WebRoot = extra.B1_WEB_ROOT || "https://{subdomain}.staging.b1.church";
  };

  // NOTE - None of these values are secret
  static initProd = () => {
    EnvironmentHelper.MembershipApi = "https://membershipapi.churchapps.org";
    EnvironmentHelper.MessagingApi = "https://messagingapi.churchapps.org";
    EnvironmentHelper.AttendanceApi = "https://attendanceapi.churchapps.org";
    EnvironmentHelper.GivingApi = "https://givingapi.churchapps.org";
    EnvironmentHelper.LessonsApi = "https://api.lessons.church";
    EnvironmentHelper.DoingApi = "https://doingapi.churchapps.org";
    EnvironmentHelper.ContentApi = "https://contentapi.churchapps.org";
    EnvironmentHelper.ContentRoot = "https://content.churchapps.org";
    EnvironmentHelper.LessonsRoot = "https://lessons.church";
    EnvironmentHelper.StreamingLiveRoot = "https://{subdomain}.streaminglive.church";
    EnvironmentHelper.B1WebRoot = "https://{subdomain}.b1.church";
  };
}

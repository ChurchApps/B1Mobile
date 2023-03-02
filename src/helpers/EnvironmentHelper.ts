import { STAGE, ACCESS_API, MEMBERSHIP_API, MESSAGING_API, ATTENDANCE_API, GIVING_API, CONTENT_API, CONTENT_ROOT, LESSONS_ROOT, STREAMING_LIVE_ROOT, B1_WEB_ROOT } from "@env"
import { ApiHelper } from "./ApiHelper"

export class EnvironmentHelper {
  public static MembershipApi = "";
  public static MessagingApi = "";
  public static AttendanceApi = "";
  public static GivingApi = "";
  public static ContentApi = "";
  public static LessonsRoot = "";
  public static StreamingLiveRoot = "";
  public static B1WebRoot = "";

  static ContentRoot = "";

  static init = () => {
    let stage = STAGE;
    stage = "prod";
    switch (stage) {
      case "prod": EnvironmentHelper.initProd(); break;
      default: EnvironmentHelper.initDev(); break;
    }

    ApiHelper.apiConfigs = [
      { keyName: "MembershipApi", url: EnvironmentHelper.MembershipApi, jwt: "", permisssions: [] },
      { keyName: "MessagingApi", url: EnvironmentHelper.MessagingApi, jwt: "", permisssions: [] },
      { keyName: "AttendanceApi", url: EnvironmentHelper.AttendanceApi, jwt: "", permisssions: [] },
      { keyName: "GivingApi", url: EnvironmentHelper.GivingApi, jwt: "", permisssions: [] },
      { keyName: "ContentApi", url: EnvironmentHelper.ContentApi, jwt: "", permisssions: [] }
    ]


    //leaving for now as a hack.  For some reason outputting the value makes the difference of whether it's actually populated or not.
    console.log(JSON.stringify(ApiHelper.apiConfigs[1].url));
  }

  static initDev = () => {
    EnvironmentHelper.MembershipApi = MEMBERSHIP_API || "";
    EnvironmentHelper.MessagingApi = MESSAGING_API || "";
    EnvironmentHelper.AttendanceApi = ATTENDANCE_API || "";
    EnvironmentHelper.GivingApi = GIVING_API || "";
    EnvironmentHelper.ContentApi = CONTENT_API || "";
    EnvironmentHelper.ContentRoot = CONTENT_ROOT || "";
    EnvironmentHelper.LessonsRoot = LESSONS_ROOT || "";
    EnvironmentHelper.StreamingLiveRoot = STREAMING_LIVE_ROOT || "";
    EnvironmentHelper.B1WebRoot = B1_WEB_ROOT || "";
  }

  // NOTE - None of these values are secret
  static initProd = () => {
    EnvironmentHelper.MembershipApi = "https://membershipapi.churchapps.org";
    EnvironmentHelper.MessagingApi = "https://messagingapi.churchapps.org";
    EnvironmentHelper.AttendanceApi = "https://attendanceapi.churchapps.org";
    EnvironmentHelper.GivingApi = "https://givingapi.churchapps.org";
    EnvironmentHelper.ContentApi = "https://contentapi.churchapps.org";
    EnvironmentHelper.ContentRoot = "https://content.churchapps.org";
    EnvironmentHelper.LessonsRoot = "https://lessons.church";
    EnvironmentHelper.StreamingLiveRoot = "https://{subdomain}.streaminglive.church";
    EnvironmentHelper.B1WebRoot = "https://{subdomain}.b1.church";
  }

}
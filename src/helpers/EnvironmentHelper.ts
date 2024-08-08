import { ApiHelper } from "@churchapps/mobilehelper";
import { ATTENDANCE_API, B1_WEB_ROOT, CONTENT_API, CONTENT_ROOT, DOING_API, GIVING_API, LESSONS_API, LESSONS_ROOT, MEMBERSHIP_API, MESSAGING_API, STAGE, STREAMING_LIVE_ROOT } from "@env";

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
    let stage = STAGE;
    //stage = "prod";
    stage = "staging";
    switch (stage) {
      case "prod": EnvironmentHelper.initProd(); break;
      default: EnvironmentHelper.initDev(); break;
    }

    ApiHelper.apiConfigs = [
      { keyName: "MembershipApi", url: EnvironmentHelper.MembershipApi, jwt: "", permisssions: [] },
      { keyName: "MessagingApi", url: EnvironmentHelper.MessagingApi, jwt: "", permisssions: [] },
      { keyName: "AttendanceApi", url: EnvironmentHelper.AttendanceApi, jwt: "", permisssions: [] },
      { keyName: "GivingApi", url: EnvironmentHelper.GivingApi, jwt: "", permisssions: [] },
      { keyName: "ContentApi", url: EnvironmentHelper.ContentApi, jwt: "", permisssions: [] },
      { keyName: "DoingApi", url: EnvironmentHelper.DoingApi, jwt: "", permisssions: [] },
      { keyName: "LessonsApi", url: EnvironmentHelper.LessonsApi, jwt: "", permisssions: [] }
    ]


    //leaving for now as a hack.  For some reason outputting the value makes the difference of whether it's actually populated or not.
    console.log(JSON.stringify(ApiHelper.apiConfigs[1].url));
  }

  static initDev = () => {
    EnvironmentHelper.MembershipApi = MEMBERSHIP_API || "https://membershipapi.staging.churchapps.org";
    EnvironmentHelper.MessagingApi = MESSAGING_API || "https://messagingapi.staging.churchapps.org";
    EnvironmentHelper.AttendanceApi = ATTENDANCE_API || "https://attendanceapi.staging.churchapps.org";
    EnvironmentHelper.GivingApi = GIVING_API || "https://givingapi.staging.churchapps.org";
    EnvironmentHelper.LessonsApi = LESSONS_API || "https://api.staging.lessons.church";
    EnvironmentHelper.DoingApi = DOING_API || "https://doingapi.staging.churchapps.org";
    EnvironmentHelper.ContentApi = CONTENT_API || "https://contentapi.staging.churchapps.org";
    EnvironmentHelper.ContentRoot = CONTENT_ROOT || "https://content.staging.churchapps.org";
    EnvironmentHelper.LessonsRoot = LESSONS_ROOT || "https://staging.lessons.church";
    EnvironmentHelper.StreamingLiveRoot = STREAMING_LIVE_ROOT || "https://{subdomain}.staging.streaminglive.church";
    EnvironmentHelper.B1WebRoot = B1_WEB_ROOT || "https://{subdomain}.staging.b1.church";
  }

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
  }

}
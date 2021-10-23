import { STAGE, ACCESS_API, MEMBERSHIP_API, ATTENDANCE_API, B1_API, CONTENT_ROOT } from "@env"

export class EnvironmentHelper {
  private static AccessApi = "";
  private static MembershipApi = "";
  private static AttendanceApi = "";
  private static B1Api = "";

  static ContentRoot = "";

  static init = () => {
    switch(STAGE) {
      case "staging": EnvironmentHelper.initStaging(); break;
      case "prod": EnvironmentHelper.initProd(); break;
      default: EnvironmentHelper.initDev(); break;
    }

    // TODO - configure ApiHelper here
  }

  static initDev = () => {
    EnvironmentHelper.AccessApi = ACCESS_API || "";
    EnvironmentHelper.MembershipApi = MEMBERSHIP_API || "";
    EnvironmentHelper.AttendanceApi = ATTENDANCE_API || "";
    EnvironmentHelper.B1Api = B1_API || "";
    EnvironmentHelper.ContentRoot = CONTENT_ROOT || "";
  }

  // NOTE - None of these values are secret
  static initStaging = () => {
    EnvironmentHelper.AccessApi = "https://accessapi.staging.churchapps.org";
    EnvironmentHelper.MembershipApi = "https://membershipapi.staging.churchapps.org";
    EnvironmentHelper.AttendanceApi = "https://attendanceapi.staging.churchapps.org";
    EnvironmentHelper.B1Api = "https://api.staging.b1.church";
    EnvironmentHelper.ContentRoot = "https://content.staging.churchapps.org";
  }

  // NOTE - None of these values are secret
  static initProd = () => {
    EnvironmentHelper.AccessApi = "https://accessapi.churchapps.org";
    EnvironmentHelper.MembershipApi = "https://membershipapi.churchapps.org";
    EnvironmentHelper.AttendanceApi = "https://attendanceapi.churchapps.org";
    EnvironmentHelper.B1Api = "https://api.b1.church";
    EnvironmentHelper.ContentRoot = "https://content.churchapps.org";
  }
}
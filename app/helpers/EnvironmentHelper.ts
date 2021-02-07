import { ApiHelper } from "./ApiHelper";

export class EnvironmentHelper {
    private static AccessApi = "";
    private static AttendanceApi = "";
    private static GivingApi = "";
    private static MembershipApi = "";
    private static B1Api = "";
    static ImageBase = "";

    static init = () => {
        switch (process.env.REACT_APP_STAGE) {
            case "staging": EnvironmentHelper.initStaging(); break;
            case "prod": EnvironmentHelper.initProd(); break;
            default: EnvironmentHelper.initDev(); break;
        }
        ApiHelper.apiConfigs = [
            { keyName: "AccessApi", url: EnvironmentHelper.AccessApi, jwt: "", permisssions: [] },
            { keyName: "AttendanceApi", url: EnvironmentHelper.AttendanceApi, jwt: "", permisssions: [] },
            { keyName: "GivingApi", url: EnvironmentHelper.GivingApi, jwt: "", permisssions: [] },
            { keyName: "MembershipApi", url: EnvironmentHelper.MembershipApi, jwt: "", permisssions: [] },
            { keyName: "B1Api", url: EnvironmentHelper.B1Api, jwt: "", permisssions: [] },
        ];
    }

    static initDev = () => {
        EnvironmentHelper.AccessApi = process.env.REACT_APP_ACCESS_API || "";
        EnvironmentHelper.AttendanceApi = process.env.REACT_APP_ATTENDANCE_API || "";
        EnvironmentHelper.GivingApi = process.env.REACT_APP_GIVING_API || "";
        EnvironmentHelper.MembershipApi = process.env.REACT_APP_MEMBERSHIP_API || "";
        EnvironmentHelper.B1Api = process.env.REACT_APP_B1_API || "";
        EnvironmentHelper.ImageBase = process.env.REACT_APP_IMAGE_BASE || ""
    }

    //NOTE: None of these values are secret.
    static initStaging = () => {
        EnvironmentHelper.AccessApi = "https://accessapi.staging.churchapps.org";
        EnvironmentHelper.AttendanceApi = "https://attendanceapi.staging.churchapps.org";
        EnvironmentHelper.GivingApi = "https://givingapi.staging.churchapps.org";
        EnvironmentHelper.MembershipApi = "https://membershipapi.staging.churchapps.org";
        EnvironmentHelper.B1Api = "https://b1api.staging.churchapps.org"
        EnvironmentHelper.ImageBase = "https://app.staging.chums.org"
    }

    //NOTE: None of these values are secret.
    static initProd = () => {
        EnvironmentHelper.AccessApi = "https://accessapi.churchapps.org";
        EnvironmentHelper.AttendanceApi = "https://attendanceapi.churchapps.org";
        EnvironmentHelper.GivingApi = "https://givingapi.churchapps.org";
        EnvironmentHelper.MembershipApi = "https://membershipapi.churchapps.org";
        EnvironmentHelper.B1Api = "https://b1api.churchapps.org"
        EnvironmentHelper.ImageBase = "https://app.chums.org"
    }

}


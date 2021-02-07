import { ApiHelper } from "./ApiHelper";
import Constants from "expo-constants";
import { ENV } from "../../Env";

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
        const baseUrl = Constants.manifest.debuggerHost?.split(':').shift() || "";
        console.log(baseUrl)

        EnvironmentHelper.AccessApi = ENV.accessApi.replace("localhost", baseUrl) || "";
        EnvironmentHelper.AttendanceApi = ENV.attendanceApi.replace("localhost", baseUrl) || "";
        EnvironmentHelper.GivingApi = ENV.givingApi.replace("localhost", baseUrl) || "";
        EnvironmentHelper.MembershipApi = ENV.membershipApi.replace("localhost", baseUrl) || "";
        EnvironmentHelper.B1Api = ENV.b1Api.replace("localhost", baseUrl) || "";
        EnvironmentHelper.ImageBase = ENV.imageBase.replace("localhost", baseUrl) || ""
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


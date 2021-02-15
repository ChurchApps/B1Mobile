import { ApiHelper } from "./ApiHelper";
import Constants from "expo-constants";

export class EnvironmentHelper {
    static AccessApi = "http://localhost:8082";
    static B1Api = "http://localhost:8300";
    static ChumsImageUrl = "https://app.staging.chums.org";

    /*
    static AccessManagementApiUrl = "https://api.staging.livecs.org";
    static B1ApiUrl = "https://api.staging.b1.church";
    static ChumsImageUrl = "https://app.staging.chums.org";
    static ChumsApiUrl = "https://api.staging.chums.org";
    */



    static init = () => {
        ApiHelper.apiConfigs = [
            { keyName: "AccessApi", url: EnvironmentHelper.getUrl(EnvironmentHelper.AccessApi), jwt: "", permisssions: [] },
            { keyName: "B1Api", url: EnvironmentHelper.getUrl(EnvironmentHelper.B1Api), jwt: "", permisssions: [] },
        ];
        ApiHelper.defaultApi = "B1Api";
    }

    static getUrl = (url: string) => {
        var result = "";
        if (url.indexOf("://localhost") > -1) {
            const server = Constants.manifest.debuggerHost?.split(':').shift();
            if (server !== undefined) result = url.replace("localhost", server);
        } else result = url;
        return result;
    }

}


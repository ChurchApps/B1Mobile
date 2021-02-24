import { ApiHelper } from "./ApiHelper";
import { LoginResponseInterface, LinkInterface, LoginRequestInterface } from "./Interfaces";
import { CachedData } from "./CachedData";

export class UserHelper {

    static login = async (req: LoginRequestInterface) => {
        const resp: LoginResponseInterface = await ApiHelper.postAnonymous("/users/login", req, "AccessApi");
        const success = await UserHelper.handleLogin(resp);
        return success;
    }

    static handleLogin = async (resp: LoginResponseInterface): Promise<boolean> => {
        if (resp === undefined || resp.errors?.length > 0) {
            return false;
        } else {
            CachedData.church = resp.churches[0];
            resp.churches[0].apis?.forEach(api => { ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions); });
            await UserHelper.loadTabs();
            return true;
        }
    }

    static loadTabs = async () => {
        CachedData.tabs = await ApiHelper.get("/links/church/" + CachedData.church?.id + "?category=tab", "B1Api");
    }

}


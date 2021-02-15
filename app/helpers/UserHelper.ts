import { ApiHelper } from "./ApiHelper";
import { LoginResponseInterface, LinkInterface, LoginRequestInterface } from "./Interfaces";
import { CachedData } from "./CachedData";

export class UserHelper {

    static login = async (req: LoginRequestInterface) => {
        const resp: LoginResponseInterface = await ApiHelper.postAnonymous("/users/login", req, "AccessApi");
        const success = await UserHelper.hanldeLogin(resp);
        return success;
    }

    static hanldeLogin = async (resp: LoginResponseInterface): Promise<boolean> => {
        console.log("RESPONSE");
        console.log(resp);
        if (resp === undefined || resp.errors?.length > 0) {
            return false;
        } else {
            CachedData.church = resp.churches[0];
            resp.churches[0].apis?.forEach(api => { ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions); });
            UserHelper.loadTabs();
            return true;
        }
    }


    static loadTabs = () => {
        ApiHelper.get("/links?category=tab", "B1Api").then((tabs: LinkInterface[]) => {
            CachedData.tabs = tabs;

        });
    }

}


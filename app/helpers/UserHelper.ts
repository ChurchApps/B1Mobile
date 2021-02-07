import { ChumsCachedData } from '../screens/drawer/checkin/helpers';
import { UserInterface, ChurchInterface, LoginResponseInterface, RolePermissionInterface, IPermission, LinkInterface } from './Interfaces'
import { ApiHelper } from "./ApiHelper";
import { Utils } from "./Utils";
import { EnvironmentHelper } from './EnvironmentHelper';

export class UserHelper {
    static currentChurch: ChurchInterface;
    static churches: ChurchInterface[];
    static user: UserInterface;
    //static currentSettings: SettingInterface;
    static currentPermissions: RolePermissionInterface[];
    static tabs: LinkInterface[];

    static handleLoginSuccess = async (resp: LoginResponseInterface) => {
        if (Object.keys(resp).length !== 0) {
            UserHelper.churches = [];

            resp.churches.forEach((c) => {
                var add = false;
                c.apis?.forEach((api) => {
                    if (api.keyName === ApiHelper.defaultApi) add = true;
                });
                if (add) UserHelper.churches.push(c);
            });

            if (UserHelper.churches.length > 0) {
                UserHelper.user = resp.user;
                UserHelper.selectChurch();
                UserHelper.tabs = await ApiHelper.get("/links?type=tabs", "B1Api");
            } else {
                //handleLoginErrors(["No permissions"]);

            }
        }
    }


    static handleLoginErrors = (errors: string[]) => {
        if (errors[0] === "No permissions") Utils.errorMsg("The provided login does not have access to this application.");
        else Utils.errorMsg("Invalid login. Please check your email or password.");
    }



    static selectChurch = () => {
        UserHelper.currentChurch = UserHelper.churches[0];
        UserHelper.currentChurch.apis?.forEach(api => { ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions); });
    }



    static checkAccess({ api, contentType, action }: IPermission): boolean {
        const permissions = ApiHelper.getConfig(api).permisssions;

        var result = false;
        if (permissions !== undefined) {
            permissions.forEach(element => {
                if (element.contentType === contentType && element.action === action) result = true;
            });
        }
        return result;
    }

}


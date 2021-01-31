import { ChumsCachedData } from '../screens/drawer/checkin/helpers';
import { UserInterface, ChurchInterface, SettingInterface, SwitchAppRequestInterface, ApiHelper, LoginResponseInterface, RolePermissionInterface, TabInterface } from './ApiHelper'
import { EnvironmentHelper } from './EnvironmentHelper';

export class UserHelper {
    static currentChurch: ChurchInterface;
    static churches: ChurchInterface[];
    static user: UserInterface;
    static currentSettings: SettingInterface;
    static currentPermissions: RolePermissionInterface[];
    static tabs: TabInterface[];

    private static setChurches = (allChurches: ChurchInterface[]) => {
        UserHelper.churches = [];
        allChurches.forEach(c => {
            var add = false;
            c.apps?.forEach(a => { if (a.name === "B1") add = true; })
            if (add) UserHelper.churches.push(c);
        });
        UserHelper.selectChurch(UserHelper.churches[0].id || 0);
    }

    static handleLogin = async (resp: LoginResponseInterface) => {
        ApiHelper.jwt = resp.token;
        ApiHelper.amJwt = resp.token;
        UserHelper.user = resp.user;
        UserHelper.setChurches(resp.churches);
        console.log("loading")
        UserHelper.tabs = await ApiHelper.apiGet("/tabs");
        console.log("made it")
    }

    static selectChurch = (churchId: number) => {
        var church = null;
        UserHelper.churches.forEach(c => { if (c.id === churchId) church = c; });
        if (church === null) window.location.reload();
        else {
            UserHelper.currentChurch = church;

            UserHelper.currentChurch.apps?.forEach(app => {
                if (app.name === "B1") UserHelper.currentPermissions = app.permissions;
            })

            const data: SwitchAppRequestInterface = { appName: "B1", churchId: UserHelper.currentChurch.id || 0 };
            ApiHelper.apiPost(EnvironmentHelper.AccessManagementApiUrl + '/users/switchApp', data).then((resp: LoginResponseInterface) => {
                ApiHelper.jwt = resp.token;
            });
        }
    }


    static checkAccess(contentType: string, action: string): boolean {
        var result = false;
        if (UserHelper.currentPermissions !== undefined) {
            UserHelper.currentPermissions.forEach(element => {
                if (element.contentType === contentType && element.action === action) result = true;
            });
        }
        return result;
    }

}


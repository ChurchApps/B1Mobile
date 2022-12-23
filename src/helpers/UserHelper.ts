import { ApiHelper, IPermission, UserInterface } from ".";
import { AppearanceInterface, ChurchInterface, LoginUserChurchInterface } from "./Interfaces";

export class UserHelper {
  static churches: ChurchInterface[];
  static currentUserChurch: LoginUserChurchInterface;
  static user: UserInterface;
  static links: any[];
  static churchAppearance: AppearanceInterface;

  static async setCurrentUserChurch(userChurch: LoginUserChurchInterface) {
    UserHelper.currentUserChurch = userChurch;
    UserHelper.churchAppearance = await ApiHelper.getAnonymous("/settings/public/" + userChurch.church.id, "MembershipApi");
  }

  static async setPersonRecord() {
    if (UserHelper.currentUserChurch && !UserHelper.currentUserChurch.person) {
      const data: any = await ApiHelper.get(`/people/claim/${UserHelper.currentUserChurch.church.id}`, "MembershipApi");
      UserHelper.currentUserChurch.person = data;
    }
  }

  static checkAccess({ api, contentType, action }: IPermission): boolean {
    const permissions = ApiHelper.getConfig(api)?.permisssions;

    let result = false;
    if (permissions !== undefined) {
      permissions.forEach(element => {
        if (element.contentType === contentType && element.action === action) result = true;
      });
    }
    return result;
  }

}
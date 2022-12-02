import { PersonInterface, ApiHelper, IPermission, UserInterface } from ".";
import { AppearanceInterface, ChurchInterface, LoginUserChurchInterface } from "./Interfaces";

export class UserHelper {
  static churches: ChurchInterface[];
  static currentUserChurch: LoginUserChurchInterface;
  static person: PersonInterface;
  static user: UserInterface;
  static links: any[];
  static churchAppearance: AppearanceInterface;

  static async setCurrentUserChurch(userChurch: LoginUserChurchInterface) {
    UserHelper.currentUserChurch = userChurch;
    UserHelper.churchAppearance = await ApiHelper.getAnonymous("/settings/public/" + userChurch.church.id, "MembershipApi");
  }

  static async setPersonRecord() {
    if (UserHelper.currentUserChurch) {
      //const person: PersonInterface = await ApiHelper.get(`/people/${UserHelper.currentChurch.personId}`, "MembershipApi");
      const data: any = await ApiHelper.get(`/people/claim/${UserHelper.currentUserChurch.church.id}`, "MembershipApi");
      UserHelper.person = data.person;
      //if (this.currentChurch.personId) this.currentChurch.personId = UserHelper.person.id
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
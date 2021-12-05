import { ChurchInterface, PersonInterface, ApiHelper, IPermission } from ".";

export class UserHelper {
  static currentChurch: ChurchInterface;
  static person: PersonInterface

  static async setPersonRecord() {
    const person: PersonInterface = await ApiHelper.get(`/people/${UserHelper.currentChurch.personId}`, "MembershipApi");
    UserHelper.person = person;
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
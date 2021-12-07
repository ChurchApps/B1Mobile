import { ChurchInterface, PersonInterface, ApiHelper, IPermission, UserInterface } from ".";

export class UserHelper {
  static churches: ChurchInterface[];
  static currentChurch: ChurchInterface;
  static person: PersonInterface;
  static user: UserInterface;



  static async setPersonRecord() {
    //const person: PersonInterface = await ApiHelper.get(`/people/${UserHelper.currentChurch.personId}`, "MembershipApi");
    const data: any = await ApiHelper.get(`/people/claim/${UserHelper.currentChurch.id}`, "MembershipApi");
    UserHelper.person = data.person;
    if (this.currentChurch.personId) this.currentChurch.personId = UserHelper.person.id
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
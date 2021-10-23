import { ChurchInterface, PersonInterface, ApiHelper } from ".";

export class Userhelper {
  static currentChurch: ChurchInterface;
  static person: PersonInterface

  static async setPersonRecord() {
    const person: PersonInterface = await ApiHelper.get(`/people/${Userhelper.currentChurch.personId}`, "MembershipApi");
    Userhelper.person = person;
  }

  // TODO - MAKE SURE TO ALSO UPDATE PERSON RECORD WHEN CHURCH IS CHANGED FROM CHURCH SELECT SCREEN

}
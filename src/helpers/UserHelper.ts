import { ApiHelper } from "@churchapps/mobilehelper";
import analytics from '@react-native-firebase/analytics';
import { Platform } from "react-native";
import { IPermission, UserInterface } from ".";
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

  static async addAnalyticsEvent(eventName : string, dataBody : any) {
    await analytics().logEvent(eventName, dataBody);
  }

  static async addOpenScreenEvent(screenName: string){
    await analytics().logEvent("page_view", {
      id: Date.now(),
      device : Platform.OS,
      page: screenName,
    });
  }
}
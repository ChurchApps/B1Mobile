import { ApiHelper, LoginResponseInterface } from "@churchapps/mobilehelper";
import { Platform } from "react-native";
// import { logAnalyticsEvent } from "../config/firebase";
import { CacheHelper } from "./CacheHelper";
import { AppearanceInterface, ChurchInterface, IPermission, LoginUserChurchInterface, UserInterface } from "./Interfaces";
import { PushNotificationHelper } from "./PushNotificationHelper";

export class UserHelper {
  static churches: ChurchInterface[];
  static userChurches: LoginUserChurchInterface[];
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
      console.log(`/people/claim/${UserHelper.currentUserChurch.church.id}`, "MembershipApi")
      const data: any = await ApiHelper.get(`/people/claim/${UserHelper.currentUserChurch.church.id}`, "MembershipApi");
      UserHelper.currentUserChurch.person = data;
    }

    PushNotificationHelper.registerUserDevice();
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

  static async addAnalyticsEvent(eventName: string, dataBody: any) {
    // logAnalyticsEvent(eventName, dataBody);
    console.log('Analytics event (disabled):', eventName, dataBody);
  }

  static async addOpenScreenEvent(screenName: string) {
    // await analytics().logEvent("page_view", {
    //   id: Date.now(),
    //   device: Platform.OS,
    //   page: screenName,
    // });
    console.log('Screen view:', screenName);
  }


  static handleLogin = async (data: LoginResponseInterface) => {
    var currentChurch: LoginUserChurchInterface = data.userChurches[0];

    let church = CacheHelper.church;
    if (church != null && church?.id != null && church.id != "") {
      currentChurch = data.userChurches.find((churches) => churches.church.id == church?.id) ?? data.userChurches[0]
    }

    const userChurch: LoginUserChurchInterface = currentChurch

    UserHelper.user = data.user;
    UserHelper.userChurches = data.userChurches;
    const churches: ChurchInterface[] = [];
    data.userChurches.forEach(uc => churches.push(uc.church));
    UserHelper.churches = churches;

    if (userChurch) await UserHelper.setCurrentUserChurch(userChurch);
    //console.log("USER CHURCH IS", userChurch);

    UserHelper.addAnalyticsEvent('login', {
      id: Date.now(),
      device: Platform.OS,
      church: userChurch.church.name,
    });

    ApiHelper.setDefaultPermissions(userChurch?.jwt || "");
    userChurch?.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions))
    ApiHelper.setPermissions("MessagingApi", userChurch?.jwt || "", [])
    await UserHelper.setPersonRecord()  // to fetch person record, ApiHelper must be properly initialzed
    await CacheHelper.setValue("user", data.user);


    if (userChurch && !church) await CacheHelper.setValue("church", userChurch.church);


  }


}
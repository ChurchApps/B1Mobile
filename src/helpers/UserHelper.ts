import { ApiHelper, LoginResponseInterface } from "../mobilehelper";
import { Platform } from "react-native";
import { logAnalyticsEvent } from "../config/firebase";
import { CacheHelper } from "./CacheHelper";
import { SecureStorageHelper } from "./SecureStorageHelper";
import { AppearanceInterface, ChurchInterface, IPermission, LoginUserChurchInterface, UserInterface, PersonInterface, RolePermissionInterface } from "./Interfaces";
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
      console.log(`/people/claim/${UserHelper.currentUserChurch.church.id}`, "MembershipApi");
      const data: { person: PersonInterface } = await ApiHelper.get(`/people/claim/${UserHelper.currentUserChurch.church.id}`, "MembershipApi");
      UserHelper.currentUserChurch.person = data.person;
    }

    PushNotificationHelper.registerUserDevice();
  }

  static checkAccess({ api, contentType, action }: IPermission): boolean {
    const permissions = ApiHelper.getConfig(api)?.permissions;

    let result = false;
    if (permissions !== undefined) {
      permissions.forEach(element => {
        if (element.contentType === contentType && element.action === action) result = true;
      });
    }
    return result;
  }

  static async addAnalyticsEvent(eventName: string, dataBody: any) {
    await logAnalyticsEvent(eventName, dataBody);
  }

  static async addOpenScreenEvent(screenName: string, parameters?: any) {
    await logAnalyticsEvent("page_view", {
      id: Date.now(),
      device: Platform.OS,
      page: screenName,
      ...parameters
    });
  }

  /**
   * Load JWT tokens from secure storage on app initialization
   */
  static async loadSecureTokens(): Promise<void> {
    try {
      const defaultToken = await SecureStorageHelper.getSecureItem("default_jwt");
      if (defaultToken) {
        ApiHelper.setDefaultPermissions(defaultToken);
      }

      // Load API-specific tokens
      const apiTokens = await SecureStorageHelper.getSecureItem("api_tokens");
      if (apiTokens) {
        const tokens = JSON.parse(apiTokens);
        Object.entries(tokens).forEach(([apiName, tokenData]: [string, any]) => {
          ApiHelper.setPermissions(apiName, tokenData.jwt, tokenData.permissions || []);
        });
      }
    } catch (error) {
      console.error("Failed to load secure tokens:", error);
    }
  }

  /**
   * Store JWT tokens securely
   */
  static async storeSecureTokens(userChurch: LoginUserChurchInterface): Promise<void> {
    try {
      // Store default JWT token
      if (userChurch?.jwt) {
        await SecureStorageHelper.setSecureItem("default_jwt", userChurch.jwt);
      }

      // Store API-specific tokens
      if (userChurch?.apis && userChurch.apis.length > 0) {
        const apiTokens: Record<string, { jwt: string; permissions: RolePermissionInterface[] }> = {};
        userChurch.apis.forEach(api => {
          if (api.keyName && api.jwt) {
            apiTokens[api.keyName] = {
              jwt: api.jwt,
              permissions: api.permissions || []
            };
          }
        });
        
        // Also store MessagingApi token
        if (userChurch.jwt) {
          apiTokens["MessagingApi"] = {
            jwt: userChurch.jwt,
            permissions: []
          };
        }

        await SecureStorageHelper.setSecureItem("api_tokens", JSON.stringify(apiTokens));
      }
    } catch (error) {
      console.error("Failed to store secure tokens:", error);
    }
  }

  /**
   * Clear all stored JWT tokens (for logout)
   */
  static async clearSecureTokens(): Promise<void> {
    try {
      await SecureStorageHelper.removeSecureItem("default_jwt");
      await SecureStorageHelper.removeSecureItem("api_tokens");
    } catch (error) {
      console.error("Failed to clear secure tokens:", error);
    }
  }

  static handleLogin = async (data: LoginResponseInterface) => {
    let currentChurch: LoginUserChurchInterface = data.userChurches[0];

    let church = CacheHelper.church;
    if (church != null && church?.id != null && church.id != "") {
      currentChurch = data.userChurches.find(churches => churches.church.id == church?.id) ?? data.userChurches[0];
    }

    const userChurch: LoginUserChurchInterface = currentChurch;

    UserHelper.user = data.user;
    UserHelper.userChurches = data.userChurches;
    const churches: ChurchInterface[] = [];
    data.userChurches.forEach(uc => churches.push(uc.church));
    UserHelper.churches = churches;

    if (userChurch) await UserHelper.setCurrentUserChurch(userChurch);
    //console.log("USER CHURCH IS", userChurch);

    UserHelper.addAnalyticsEvent("login", {
      id: Date.now(),
      device: Platform.OS,
      church: userChurch.church.name
    });

    // Set API permissions (in memory)
    ApiHelper.setDefaultPermissions(userChurch?.jwt || "");
    userChurch?.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions));
    ApiHelper.setPermissions("MessagingApi", userChurch?.jwt || "", []);
    
    // Store JWT tokens securely
    await UserHelper.storeSecureTokens(userChurch);
    
    await UserHelper.setPersonRecord(); // to fetch person record, ApiHelper must be properly initialzed
    await CacheHelper.setValue("user", data.user);

    if (userChurch && !church) await CacheHelper.setValue("church", userChurch.church);
  };
}

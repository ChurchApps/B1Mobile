import { ApiHelper } from "../mobilehelper";
import { Platform } from "react-native";
import { logAnalyticsEvent } from "../config/firebase";
import { SecureStorageHelper } from "./SecureStorageHelper";
import { IPermission } from "./Interfaces";

export class UserHelper {
  // UserHelper now only contains utility methods
  // All state is managed in useUserStore

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
}

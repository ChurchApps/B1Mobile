import { ApiHelper } from "@churchapps/helpers";
import { Platform } from "react-native";
import { logAnalyticsEvent } from "../config/firebase";
import { SecureStorageHelper } from "./SecureStorageHelper";
import { SessionTokenHelper } from "./SessionTokenHelper";
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

  static async addAnalyticsEvent(eventName: string, dataBody: Record<string, unknown>) {
    await logAnalyticsEvent(eventName, dataBody);
  }

  static async addOpenScreenEvent(screenName: string, parameters?: Record<string, unknown>) {
    await logAnalyticsEvent("page_view", {
      id: Date.now(),
      device: Platform.OS,
      page: screenName,
      ...parameters
    });
  }

  /**
   * Check if JWT token is valid and not expired
   */
  static isTokenValid(jwt: string): boolean {
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Attempt to refresh JWT token using existing token
   * Note: The token may be expired - the server will validate and issue a new one
   * if the refresh is still allowed (within refresh window)
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const currentToken = await SecureStorageHelper.getSecureItem("default_jwt");
      if (!currentToken) {
        return false;
      }

      const response = await ApiHelper.postAnonymous("/users/login", { jwt: currentToken }, "MembershipApi");
      if (response.user?.jwt) {
        await SecureStorageHelper.setSecureItem("default_jwt", response.user.jwt);
        ApiHelper.setDefaultPermissions(response.user.jwt);
        return true;
      }
    } catch (error) {
      console.log("Token refresh failed:", error);
      return false;
    }
    return false;
  }

  static async loadSecureTokens(): Promise<void> {
    try {
      await SessionTokenHelper.migrateAndWipePersistedTokens();

      const defaultToken = await SecureStorageHelper.getSecureItem("default_jwt");
      if (defaultToken) {
        if (this.isTokenValid(defaultToken)) ApiHelper.setDefaultPermissions(defaultToken);
        else console.log("Stored JWT token is expired, will attempt refresh during authentication");
      }

      const hasOldTokens = await SecureStorageHelper.hasSecureItem("api_tokens");
      if (hasOldTokens) await SecureStorageHelper.removeSecureItem("api_tokens");
    } catch (error) {
      console.error("Failed to load secure tokens:", error);
    }
  }

  static async clearSecureTokens(churchId?: string): Promise<void> {
    try {
      await SessionTokenHelper.clearSessionTokens(churchId);
    } catch (error) {
      console.error("Failed to clear secure tokens:", error);
    }
  }
}

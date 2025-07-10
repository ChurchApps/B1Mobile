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
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const currentToken = await SecureStorageHelper.getSecureItem("default_jwt");
      if (!currentToken || !this.isTokenValid(currentToken)) {
        return false;
      }

      const response = await ApiHelper.postAnonymous("/users/refresh", { jwt: currentToken }, "MembershipApi");
      if (response.jwt) {
        await SecureStorageHelper.setSecureItem("default_jwt", response.jwt);
        ApiHelper.setDefaultPermissions(response.jwt);
        return true;
      }
    } catch (error) {
      console.log("Token refresh failed:", error);
      return false;
    }
    return false;
  }

  /**
   * Load JWT tokens from secure storage on app initialization
   */
  static async loadSecureTokens(): Promise<void> {
    try {
      const defaultToken = await SecureStorageHelper.getSecureItem("default_jwt");
      if (defaultToken) {
        // Check if token is still valid
        if (this.isTokenValid(defaultToken)) {
          ApiHelper.setDefaultPermissions(defaultToken);
        } else {
          console.log("Stored JWT token is expired, will attempt refresh during authentication");
          // Don't set expired token, let authentication handle it
        }
      }

      // One-time migration: Remove old api_tokens to prevent SecureStore size warning
      const hasOldTokens = await SecureStorageHelper.hasSecureItem("api_tokens");
      if (hasOldTokens) {
        await SecureStorageHelper.removeSecureItem("api_tokens");
        console.log("Migrated: Removed old api_tokens from SecureStore");
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
    } catch (error) {
      console.error("Failed to clear secure tokens:", error);
    }
  }
}

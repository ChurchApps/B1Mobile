import { AppState, AppStateStatus } from "react-native";
import { ApiHelper } from "../mobilehelper";
import { SecureStorageHelper } from "./SecureStorageHelper";
import { UserHelper } from "./UserHelper";
import { useUserStore } from "../stores/useUserStore";


export class AppLifecycleManager {
  private static appStateSubscription: any = null;
  private static currentAppState: AppStateStatus = AppState.currentState;
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) {
      console.log("AppLifecycleManager already initialized");
      return;
    }

    console.log("Initializing AppLifecycleManager");
    this.isInitialized = true;

    this.appStateSubscription = AppState.addEventListener("change", this.handleAppStateChange);
  }

  static cleanup() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.isInitialized = false;
    console.log("AppLifecycleManager cleaned up");
  }

  private static handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const previousState = this.currentAppState;
    this.currentAppState = nextAppState;
    const isComingToForeground = (previousState === "background" || previousState === "inactive") && nextAppState === "active";
    if (isComingToForeground) {
      console.log("App resumed from background, restoring session...");
      await this.restoreSessionOnResume();
    }
  };

  private static async restoreSessionOnResume() {
    try {
      const userStore = useUserStore.getState();
      const user = userStore.user;

      if (!user) {
        console.log("No user logged in, skipping session restore");
        return;
      }

      const jwt = await SecureStorageHelper.getSecureItem("default_jwt");
      if (!jwt) {
        console.log("No JWT found in secure storage, user needs to re-login");
        return;
      }

      if (UserHelper.isTokenValid(jwt)) {
        console.log("JWT token is valid, restoring API permissions");
        ApiHelper.setDefaultPermissions(jwt);

        const currentUserChurch = userStore.currentUserChurch;
        if (currentUserChurch?.apis) {
          currentUserChurch.apis.forEach(api => {
            if (api.keyName && api.jwt) {
              ApiHelper.setPermissions(api.keyName, api.jwt, api.permissions || []);
            }
          });
          ApiHelper.setPermissions("MessagingApi", jwt, []);
        }

        console.log("Session restored successfully");
      } else {
        console.log("JWT token is expired, attempting refresh...");
        const refreshed = await UserHelper.refreshToken();

        if (refreshed) {
          console.log("Token refreshed successfully");
          const newJwt = await SecureStorageHelper.getSecureItem("default_jwt");
          if (newJwt) {
            try {
              const data = await ApiHelper.postAnonymous("/users/login", { jwt: newJwt }, "MembershipApi");
              if (data.user) {
                await userStore.handleLogin(data);
                console.log("Successfully re-authenticated with refreshed token");
              }
            } catch (error) {
              console.error("Re-authentication failed after token refresh:", error);
            }
          }
        } else {
          console.log("Token refresh failed, user will need to re-login");
        }
      }
    } catch (error) {
      console.error("Error restoring session on resume:", error);
    }
  }
}

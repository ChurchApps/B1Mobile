import * as Updates from "expo-updates";
import { Alert } from "react-native";

export class UpdateHelper {
  static async checkForUpdates() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert("Update Available", "A new version of the app is available. Would you like to update now?", [
          { text: "Later", style: "cancel" },
          {
            text: "Update",
            onPress: async () => {
              try {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              } catch {
                Alert.alert("Error", "Failed to update the app. Please try again later.");
              }
            }
          }
        ]);
      }
    } catch (_error) {
      console.log("Error checking for updates:", _error);
    }
  }

  static async initializeUpdates() {
    try {
      // Check for updates on app start
      await UpdateHelper.checkForUpdates();

      // We'll handle update events through the Updates API directly
      // The addListener API has been deprecated in favor of direct API calls
    } catch (_error) {
      console.log("Error initializing updates:", _error);
    }
  }
}

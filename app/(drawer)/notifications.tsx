import React from "react";
import { useThemeColors } from "@/theme";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NotificationTab } from "../../src/components/NotificationView";
import { UserHelper } from "../../src/helpers";
import { updateCurrentScreen } from "../../src/helpers/PushNotificationHelper";

const Notifications = () => {
  const tc = useThemeColors();
  React.useEffect(() => {
    UserHelper.addOpenScreenEvent("Notifications");
    updateCurrentScreen("/(drawer)/notifications");
    return () => {
      updateCurrentScreen("");
    };
  }, []);

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: tc.background }]}>
        <View style={styles.contentContainer}>
          <NotificationTab />
        </View>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  contentContainer: { flex: 1 }
});

export default Notifications;

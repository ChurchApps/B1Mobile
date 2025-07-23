import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation as useReactNavigation, DrawerActions } from "@react-navigation/native";
import { useNavigation } from "../../src/hooks";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { NotificationTab } from "../../src/components/NotificationView";
import { UserHelper } from "../../src/helpers";
import { updateCurrentScreen } from "../../src/helpers/PushNotificationHelper";

const Notifications = () => {
  const navigation = useReactNavigation();
  const { navigateBack } = useNavigation();

  React.useEffect(() => {
    UserHelper.addOpenScreenEvent("Notifications");
    updateCurrentScreen("/(drawer)/notifications");
    return () => {
      updateCurrentScreen("");
    };
  }, []);

  const handleDrawerOpen = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleBack = () => {
    navigateBack();
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <MainHeader title="Notifications" openDrawer={handleDrawerOpen} back={handleBack} hideBell={true} />
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
  contentContainer: {
    flex: 1
  }
});

export default Notifications;

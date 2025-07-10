import { Constants } from "../../../src/helpers";
import React from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Entypo";
import { NotificationTab } from "../NotificationView";
import { HeaderBell } from "./HeaderBell";
import { useUser } from "../../stores/useUserStore";

interface Props {
  title: string;
  back?: () => void;
  openDrawer?: () => void;
  hideBell?: boolean;
}

export function MainHeader(props: Props) {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const insets = useSafeAreaInsets();
  const user = useUser();

  const styles = createStyles();

  const LeftComponent = () => (
    <View style={styles.leftContainer}>
      {props.back && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (props.back) props.back();
          }}>
          <Icon name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => {
          if (props.openDrawer) props.openDrawer();
        }}>
        <Image source={Constants.Images.ic_menu} style={styles.menuIcon} />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          {LeftComponent()}
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {props.title}
            </Text>
          </View>
          <View style={styles.rightContainer}>
            {!props.hideBell && user && (
              <HeaderBell
                toggleNotifications={() => {
                  setShowNotifications(!showNotifications);
                }}
              />
            )}
          </View>
        </View>
      </View>
      {showNotifications && <NotificationTab />}
    </>
  );
}

const createStyles = () =>
  StyleSheet.create({
    headerContainer: {
      backgroundColor: "#1565C0", // Primary blue from style guide
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      zIndex: 30
    },
    headerContent: {
      height: 56, // Standard mobile header height
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 4 // Minimal padding, buttons have their own
    },
    leftContainer: {
      flexDirection: "row",
      alignItems: "center"
    },
    backButton: {
      width: 44, // Touch target minimum
      height: 44,
      justifyContent: "center",
      alignItems: "center"
    },
    menuButton: {
      width: 48, // Slightly larger for primary action
      height: 48,
      justifyContent: "center",
      alignItems: "center"
    },
    menuIcon: {
      width: 24,
      height: 24,
      tintColor: "#FFFFFF" // White for contrast on blue background
    },
    titleContainer: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 8
    },
    headerTitle: {
      fontSize: 20, // H2 from style guide
      fontWeight: Platform.OS === "ios" ? "600" : "500",
      color: "#FFFFFF", // White for contrast on blue background
      textAlign: "center"
    },
    rightContainer: {
      width: 48, // Match left side for balance
      height: 48,
      justifyContent: "center",
      alignItems: "center"
    }
  });

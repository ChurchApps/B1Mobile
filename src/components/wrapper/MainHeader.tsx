import { Constants } from "../../../src/helpers";
import React from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { HeaderBell } from "./HeaderBell";
import { useUser } from "../../stores/useUserStore";
import { router, useNavigation } from "expo-router";

interface Props {
  title: string;
  back?: () => void;
  openDrawer?: () => void;
  hideBell?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
}

export function MainHeader(props: Props) {
  const insets = useSafeAreaInsets();
  const user = useUser();
  const navigation = useNavigation();

  const canGoBack = props.back && navigation.canGoBack();

  const styles = createStyles();

  const LeftComponent = () => (
    <View style={styles.leftContainer}>
      {
        props.back && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (canGoBack) {
                props.back();
              } else {
                router.replace('page')
              }
            }}>
            <MaterialIcons name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )
      }
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
          <View style={[styles.titleContainer, {left: canGoBack ? -22: 0}]}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {props.title}
            </Text>
          </View>
          <View style={styles.rightContainer}>
            {props.rightAction ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={props.rightAction.onPress}>
                <MaterialIcons name={props.rightAction.icon as any} size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              !props.hideBell && user && (
                <HeaderBell
                  toggleNotifications={() => {
                    router.push("/(drawer)/notifications");
                  }}
                />
              )
            )}
          </View>
        </View>
      </View>
    </>
  );
}

const createStyles = () =>
  StyleSheet.create({
    headerContainer: {
      backgroundColor: "#0D47A1", // Primary blue from style guide
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
    },
    actionButton: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center"
    }
  });

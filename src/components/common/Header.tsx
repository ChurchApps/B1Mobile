import React from "react";
import { View, Text, Image, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Constants } from "../../helpers";
import { HeaderBell } from "../wrapper/HeaderBell";
import { StandardBackButton } from "../navigation/StandardBackButton";
import { designSystem } from "../../theme/designSystem";
import { useThemeColors } from "../../theme";

interface HeaderProps {
  variant?: "blue" | "white" | "simple" | "transparent";
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showBell?: boolean;
  showLogo?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  rightComponent?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Header: React.FC<HeaderProps> = ({
  variant = "blue",
  title,
  showBack = false,
  showMenu = false,
  showBell = false,
  showLogo = true,
  onBackPress,
  onMenuPress,
  rightComponent,
  style
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tc = useThemeColors();

  const getBackgroundColor = () => {
    switch (variant) {
      case "blue": return tc.primary;
      case "white": return tc.surface;
      case "simple": return tc.surface;
      case "transparent": return tc.transparent;
      default: return tc.primary;
    }
  };

  const getTextColor = () => {
    return variant === "blue" || variant === "transparent" ? tc.white : tc.text;
  };

  const getIconColor = () => {
    return variant === "blue" || variant === "transparent" ? tc.white : tc.text;
  };

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    }
    // StandardBackButton will handle the navigation logic
  };

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      router.push("/(drawer)/page");
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor: getBackgroundColor(),
          paddingTop: insets.top,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          ...(variant === "white" && {
            borderBottomWidth: 1,
            borderBottomColor: tc.border
          })
        },
        style
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        {showBack && (
          <StandardBackButton
            color={getIconColor()}
            size={24}
            onCustomBack={onBackPress}
            style={{ marginRight: designSystem.spacing.sm }}
          />
        )}

        {showMenu && (
          <TouchableOpacity onPress={handleMenuPress} style={{ marginRight: 12 }}>
            <Ionicons name="menu" size={24} color={getIconColor()} />
          </TouchableOpacity>
        )}

        {showLogo && !title && (
          <Image
            source={
              variant === "blue" || variant === "transparent"
                ? Constants.Images.logoWhite
                : Constants.Images.logoBlue
            }
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        )}

        {title && (
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: getTextColor(),
              flex: 1
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {showBell && <HeaderBell />}
        {rightComponent}
      </View>
    </View>
  );
};

import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleProp, ViewStyle, TextStyle } from "react-native";
import { Constants } from "../../helpers";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "warning" | "success" | "outline";
  size?: "small" | "medium" | "large";
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  onPress,
  disabled = false,
  loading = false,
  children,
  style,
  textStyle,
  fullWidth = false
}) => {
  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (isDisabled) return "#cccccc";

    switch (variant) {
      case "primary": return Constants.Colors.button_bg;
      case "secondary": return Constants.Colors.button_yellow;
      case "danger": return Constants.Colors.button_red;
      case "warning": return Constants.Colors.button_yellow;
      case "success": return Constants.Colors.button_dark_green;
      case "outline": return "transparent";
      default: return Constants.Colors.button_bg;
    }
  };

  const getTextColor = () => {
    if (variant === "outline") return Constants.Colors.button_bg;
    return "#ffffff";
  };

  const getPadding = () => {
    switch (size) {
      case "small": return { paddingVertical: 8, paddingHorizontal: 12 };
      case "medium": return { paddingVertical: 12, paddingHorizontal: 20 };
      case "large": return { paddingVertical: 16, paddingHorizontal: 24 };
      default: return { paddingVertical: 12, paddingHorizontal: 20 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "small": return 14;
      case "medium": return 16;
      case "large": return 18;
      default: return 16;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          ...getPadding(),
          ...(variant === "outline" && {
            borderWidth: 2,
            borderColor: Constants.Colors.button_bg
          }),
          ...(fullWidth && { width: "100%" })
        },
        style
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <Text
          style={[
            {
              color: getTextColor(),
              fontSize: getFontSize(),
              fontWeight: "600",
              textAlign: "center"
            },
            textStyle
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "secondary" | "ghost";
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  disabled = false,
  size = "medium",
  style,
  variant = "ghost"
}) => {
  const getSize = () => {
    switch (size) {
      case "small": return 32;
      case "medium": return 40;
      case "large": return 48;
      default: return 40;
    }
  };

  const getBackgroundColor = () => {
    if (variant === "ghost") return "transparent";
    if (variant === "primary") return Constants.Colors.button_bg;
    if (variant === "secondary") return Constants.Colors.gray_bg;
    return "transparent";
  };

  const buttonSize = getSize();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? 0.5 : 1
        },
        style
      ]}
      activeOpacity={0.7}
    >
      {icon}
    </TouchableOpacity>
  );
};

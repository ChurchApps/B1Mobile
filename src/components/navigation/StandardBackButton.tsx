import React from "react";
import { TouchableOpacity, Alert } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation } from "../../hooks/useNavigation";
import { designSystem } from "../../theme/designSystem";

interface StandardBackButtonProps {
  /**
   * Color of the back button icon
   */
  color?: string;
  /**
   * Size of the back button icon
   */
  size?: number;
  /**
   * Custom back action to perform instead of default behavior
   */
  onCustomBack?: () => void;
  /**
   * Whether to show confirmation dialog before going back
   */
  confirmBack?: boolean;
  /**
   * Custom confirmation message
   */
  confirmMessage?: string;
  /**
   * Fallback route if no navigation history exists
   */
  fallbackRoute?: string;
  /**
   * Whether to disable the back button
   */
  disabled?: boolean;
  /**
   * Additional style for the touchable container
   */
  style?: any;
}

export const StandardBackButton: React.FC<StandardBackButtonProps> = ({
  color = designSystem.colors.neutral[900],
  size = 24,
  onCustomBack,
  confirmBack = false,
  confirmMessage = "Are you sure you want to go back? Your changes may not be saved.",
  fallbackRoute = "/(drawer)/dashboard",
  disabled = false,
  style
}) => {
  const { navigateBack, navigateTo } = useNavigation();

  const handleBackPress = () => {
    if (disabled) return;

    if (onCustomBack) {
      if (confirmBack) {
        Alert.alert(
          "Confirm",
          confirmMessage,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Go Back", style: "destructive", onPress: onCustomBack }
          ]
        );
      } else {
        onCustomBack();
      }
      return;
    }

    // Standard back navigation with fallback
    if (confirmBack) {
      Alert.alert(
        "Confirm",
        confirmMessage,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Go Back",
            style: "destructive",
            onPress: () => {
              try {
                navigateBack();
              } catch (error) {
                // Fallback to specified route if navigation fails
                navigateTo(fallbackRoute);
              }
            }
          }
        ]
      );
    } else {
      try {
        navigateBack();
      } catch (error) {
        // Fallback to specified route if navigation fails
        navigateTo(fallbackRoute);
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={handleBackPress}
      disabled={disabled}
      style={[
        {
          padding: designSystem.spacing.sm,
          opacity: disabled ? 0.5 : 1
        },
        style
      ]}
      accessibilityLabel="Go back"
      accessibilityRole="button"
      activeOpacity={0.7}
    >
      <AntDesign
        name="arrowleft"
        size={size}
        color={color}
      />
    </TouchableOpacity>
  );
};

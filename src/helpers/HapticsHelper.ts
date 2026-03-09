import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export const HapticsHelper = {
  /** Light tap for button presses, selections */
  light() {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /** Medium tap for toggle switches, pull-to-refresh */
  medium() {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /** Success feedback for completed actions (check-in, send message) */
  success() {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /** Warning feedback */
  warning() {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  /** Error feedback */
  error() {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  /** Selection changed feedback (tab switches, picker changes) */
  selection() {
    if (Platform.OS !== "web") Haptics.selectionAsync();
  }
};

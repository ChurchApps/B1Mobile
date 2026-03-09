import { globalStyles } from "../../src/helpers";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useThemeColors } from "../theme";

interface Props {
  isLoading: boolean;
  size?: "small" | "large";
  color?: string;
  style?: any;
}

export function Loader({ isLoading, size = "large", color, style }: Props) {
  const colors = useThemeColors();
  return (
    <View style={[{ padding: 16 }, style]}>
      <ActivityIndicator
        style={[globalStyles.indicatorStyle, { backgroundColor: colors.overlay }]}
        size={size}
        color={color ?? colors.primary}
        animating={isLoading}
      />
    </View>
  );
}

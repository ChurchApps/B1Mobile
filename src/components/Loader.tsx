import { globalStyles } from "../../src/helpers";
import React from "react";
import { ActivityIndicator, View } from "react-native";

interface Props {
  isLoading: boolean;
  size?: "small" | "large";
  color?: string;
  style?: any;
}

export function Loader({ isLoading, size = "large", color = "#0D47A1", style }: Props) {
  return (
    <View style={[{ padding: 16 }, style]}>
      <ActivityIndicator 
        style={globalStyles.indicatorStyle} 
        size={size} 
        color={color} 
        animating={isLoading} 
      />
    </View>
  );
}

import React from "react";
import { ViewStyle, ImageStyle, StyleSheet } from "react-native";
import { Image, ImageSource } from "expo-image";
import { Constants } from "../helpers/Constants";

interface OptimizedImageProps {
  source: ImageSource | string;
  style?: ImageStyle | ViewStyle;
  placeholder?: ImageSource;
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  priority?: "low" | "normal" | "high";
  onLoad?: () => void;
  onError?: () => void;
  tintColor?: string;
  accessibilityLabel?: string;
  testID?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ source, style, placeholder = Constants.Images.DefaultUser, contentFit = "cover", priority = "normal", onLoad, onError, tintColor, accessibilityLabel, testID }) => <Image source={source} style={[styles.image, style]} contentFit={contentFit} priority={priority} cachePolicy="memory-disk" transition={200} onLoad={onLoad} onError={onError} placeholder={placeholder} tintColor={tintColor} accessibilityLabel={accessibilityLabel} testID={testID} />;

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%"
  }
});

export default OptimizedImage;

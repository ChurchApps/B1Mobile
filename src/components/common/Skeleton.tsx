import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate } from "react-native-reanimated";
import { useThemeColors } from "../../theme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/** A single shimmer skeleton placeholder */
export const Skeleton: React.FC<SkeletonProps> = ({ width = "100%", height = 16, borderRadius = 8, style }) => {
  const colors = useThemeColors();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]) }));

  return <Animated.View style={[{ backgroundColor: colors.divider }, { width: width as any, height, borderRadius }, animatedStyle, style]} />;
};

/** Skeleton for a card with image + text lines */
export const CardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const colors = useThemeColors();
  return (
    <View style={[{ backgroundColor: colors.surface, borderRadius: 16, overflow: "hidden", marginBottom: 16, elevation: 2, shadowColor: colors.shadowBlack, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }, style]}>
      <Skeleton width="100%" height={160} borderRadius={12} />
      <View style={styles.cardContent}>
        <Skeleton width="70%" height={18} />
        <Skeleton width="50%" height={14} style={styles.mt8} />
      </View>
    </View>
  );
};

/** Skeleton for a list row with avatar + text */
export const ListItemSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.listItem, style]}>
    <Skeleton width={48} height={48} borderRadius={24} />
    <View style={styles.listItemText}>
      <Skeleton width="60%" height={16} />
      <Skeleton width="40%" height={12} style={styles.mt8} />
    </View>
  </View>
);

/** Multiple list item skeletons */
export const ListSkeleton: React.FC<{ count?: number; style?: ViewStyle }> = ({ count = 5, style }) => (
  <View style={style}>
    {Array.from({ length: count }).map((_, i) => (
      <ListItemSkeleton key={i} style={i > 0 ? styles.mt12 : undefined} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  cardContent: { padding: 16 },
  listItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  listItemText: { flex: 1, marginLeft: 12 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 }
});

import React, { useCallback } from "react";
import { FlatList, RefreshControl, View, Text, ActivityIndicator, StyleProp, ViewStyle, ListRenderItem, TouchableOpacity } from "react-native";
import { useThemeColors } from "../../theme";

interface DataListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor?: (item: T, index: number) => string;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  emptyComponent?: React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  ItemSeparatorComponent?: React.ComponentType<any>;
  numColumns?: number;
  horizontal?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
}

export function DataList<T>({
  data,
  renderItem,
  keyExtractor,
  onRefresh,
  refreshing = false,
  loading = false,
  emptyMessage = "No items found",
  emptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  ItemSeparatorComponent,
  numColumns,
  horizontal = false,
  style,
  contentContainerStyle,
  onEndReached,
  onEndReachedThreshold = 0.5
}: DataListProps<T>) {
  const colors = useThemeColors();

  const defaultKeyExtractor = useCallback((item: T, index: number) => {
    if (keyExtractor) return keyExtractor(item, index);
    return index.toString();
  }, [keyExtractor]);

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 50 }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (emptyComponent) {
      return emptyComponent;
    }

    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 50 }}>
        <Text style={{ fontSize: 16, color: colors.textMuted, textAlign: "center" }}>
          {emptyMessage}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={defaultKeyExtractor}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        ) : undefined
      }
      ListEmptyComponent={renderEmpty}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ItemSeparatorComponent={ItemSeparatorComponent}
      numColumns={numColumns}
      horizontal={horizontal}
      style={style}
      contentContainerStyle={[
        data.length === 0 && { flex: 1 },
        contentContainerStyle
      ]}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      showsVerticalScrollIndicator={!horizontal}
      showsHorizontalScrollIndicator={horizontal}
    />
  );
}

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style, padding = 16 }) => {
  const colors = useThemeColors();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[cardStyle, style]}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

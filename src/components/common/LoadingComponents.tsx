import React from "react";
import { View, ActivityIndicator, Text, StyleProp, ViewStyle, TouchableOpacity } from "react-native";
import { Constants } from "../../helpers";
import { CommonStyles } from "../../theme/CommonStyles";
import { Button } from "./Button";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  style?: StyleProp<ViewStyle>;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message, style }) => {
  if (!visible) return null;

  return (
    <View style={[CommonStyles.loadingOverlay, style]}>
      <View style={{
        backgroundColor: "#ffffff",
        padding: 24,
        borderRadius: 8,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5
      }}>
        <ActivityIndicator size="large" color={Constants.Colors.primary || "#0D47A1"} />
        {message && (
          <Text style={[CommonStyles.bodyText, { marginTop: 12, color: "#3c3c3c", textAlign: "center" }]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

interface LoadingViewProps {
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  loading,
  error,
  onRetry,
  children,
  emptyMessage = "No data available",
  isEmpty = false,
  style
}) => {
  if (loading) {
    return (
      <View style={[CommonStyles.centerContainer, style]}>
        <ActivityIndicator size="large" color={Constants.Colors.primary || "#0D47A1"} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[CommonStyles.emptyState, style]}>
        <Text style={[CommonStyles.errorText, { fontSize: 16, textAlign: "center" }]}>
          {error}
        </Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={{ marginTop: 16 }}>
            <Text style={{ color: Constants.Colors.primary, fontSize: 16 }}>
              Tap to retry
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={[CommonStyles.emptyState, style]}>
        <Text style={CommonStyles.emptyStateText}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

interface LoadingButtonProps {
  loading: boolean;
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  style?: StyleProp<ViewStyle>;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  onPress,
  children,
  disabled = false,
  variant = "primary",
  style
}) => {
  return (
    <Button
      onPress={onPress}
      disabled={disabled || loading}
      loading={loading}
      variant={variant}
      style={style}
    >
      {children}
    </Button>
  );
};

interface InlineLoaderProps {
  size?: "small" | "large";
  color?: string;
  text?: string;
  style?: StyleProp<ViewStyle>;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({
  size = "small",
  color = Constants.Colors.primary || "#0D47A1",
  text,
  style
}) => {
  return (
    <View style={[CommonStyles.row, { justifyContent: "center", padding: 8 }, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={[CommonStyles.bodyText, { marginLeft: 8, color: "#3c3c3c" }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

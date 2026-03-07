import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import i18n from "../i18n";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

function DefaultErrorFallback({ error, retry }: { error?: Error; retry: () => void }) {
  const theme = useTheme();
  const isDark = theme.dark;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>
      <Text style={styles.title}>{i18n.t("common.somethingWentWrong")}</Text>
      <Text style={[styles.message, { color: isDark ? "#CCCCCC" : "#666666" }]}>{error?.message || i18n.t("common.unexpectedError")}</Text>
      <TouchableOpacity style={styles.button} onPress={retry}>
        <Text style={styles.buttonText}>{i18n.t("common.tryAgain")}</Text>
      </TouchableOpacity>
    </View>
  );
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

// Primary color (#0D47A1) and related values are static here because
// ErrorBoundary is a class component and cannot use hooks.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 16,
    textAlign: "center"
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24
  },
  button: {
    backgroundColor: "#0D47A1",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  }
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Constants } from "../helpers";
import i18n from "../i18n";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
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

      return (
        <View style={styles.container}>
          <Text style={styles.title}>{i18n.t("common.somethingWentWrong")}</Text>
          <Text style={styles.message}>{this.state.error?.message || i18n.t("common.unexpectedError")}</Text>
          <TouchableOpacity style={styles.button} onPress={this.retry}>
            <Text style={styles.buttonText}>{i18n.t("common.tryAgain")}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Constants.Colors.church_primary,
    marginBottom: 16,
    textAlign: "center"
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24
  },
  button: {
    backgroundColor: Constants.Colors.church_primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  }
});

import React from "react";
import { Stack } from "expo-router";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";
import { TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAppTheme } from "@/theme";
import { useNavigation } from "@/hooks";

export default function AuthLayout() {
  const { theme } = useAppTheme();
  const { navigationBackNormal } = useNavigation();

  // Common header style for all screens
  const commonHeaderOptions = {
    headerStyle: { backgroundColor: "#0D47A1" },
    headerTintColor: "#FFF",
    headerLeft: () => (
      <TouchableOpacity onPress={navigationBackNormal} style={{ marginLeft: 15 }}>
        <MaterialIcons name="arrow-back" size={24} color={theme.colors.onPrimary} />
      </TouchableOpacity>
    )
  };

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen
          name="login"
          options={{
            ...commonHeaderOptions,
            headerTitle: "Login",
            headerBackTitle: "Back"
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            ...commonHeaderOptions,
            headerTitle: "Register",
            headerBackTitle: "Back"
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{
            ...commonHeaderOptions,
            headerTitle: "Privacy Policy",
            headerBackTitle: "Back"
          }}
        />
      </Stack>
    </ErrorBoundary>
  );
}

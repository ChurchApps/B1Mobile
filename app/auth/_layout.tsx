import React from "react";
import { Stack } from "expo-router";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";
import { TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAppTheme } from "@/theme";
import { useNavigation } from "@/hooks";
import { useTranslation } from "react-i18next";

export default function AuthLayout() {
  const { theme } = useAppTheme();
  const { navigationBackNormal } = useNavigation();
  const { t } = useTranslation();

  // Common header style for all screens
  const commonHeaderOptions = {
    headerStyle: { backgroundColor: "#0D47A1" },
    headerTintColor: "#FFF",
    headerLeft: () => (
      <TouchableOpacity onPress={navigationBackNormal} style={{ marginHorizontal: 10 }}>
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
            headerTitle: t("drawer.login"),
            headerBackTitle: t("common.back")
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            ...commonHeaderOptions,
            headerTitle: t("auth.register"),
            headerBackTitle: t("common.back")
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{
            ...commonHeaderOptions,
            headerTitle: t("auth.privacyPolicy"),
            headerBackTitle: t("common.back")
          }}
        />
      </Stack>
    </ErrorBoundary>
  );
}

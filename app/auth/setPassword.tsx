import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Surface, Text, TextInput } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/theme";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { ApiHelper, LoginResponseInterface } from "../../src/helpers";
import { useUserStore } from "../../src/stores/useUserStore";

const SetPassword = () => {
  const { t } = useTranslation();
  const { theme, spacing } = useAppTheme();
  const params = useLocalSearchParams<{ authGuid?: string; email?: string }>();
  const authGuid = params.authGuid || "";
  const email = params.email || "";

  const [firstName, setFirstName] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authGuid) {
      Alert.alert(t("common.alert"), t("auth.invalidCode"), [{ text: "OK", onPress: () => router.replace("/auth/login") }]);
      return;
    }
    (async () => {
      try {
        const resp: LoginResponseInterface = await ApiHelper.postAnonymous("/users/login", { authGuid }, "MembershipApi");
        if (resp?.user?.firstName) setFirstName(resp.user.firstName);
      } catch {
        // fall through; still allow setting password
      }
    })();
  }, [authGuid]);

  const validate = () => {
    if (password.length < 8) {
      Alert.alert(t("common.alert"), t("auth.passwordTooShort"));
      return false;
    }
    if (password !== confirm) {
      Alert.alert(t("common.alert"), t("auth.passwordMismatch"));
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const resp: any = await ApiHelper.postAnonymous("/users/setPasswordGuid", { authGuid, newPassword: password }, "MembershipApi");
      if (!resp?.success) {
        Alert.alert(t("common.alert"), t("auth.invalidCode"));
        setSubmitting(false);
        return;
      }
      const loginResp: LoginResponseInterface = await ApiHelper.postAnonymous("/users/login", { email, password }, "MembershipApi");
      if (loginResp?.user != null) {
        await useUserStore.getState().handleLogin(loginResp as any);
        setSubmitting(false);
        router.replace("/(drawer)/dashboard");
      } else {
        setSubmitting(false);
        router.replace("/auth/login");
      }
    } catch (e: any) {
      setSubmitting(false);
      Alert.alert(t("common.alert"), e?.message || t("common.error"));
    }
  };

  return (
    <LoadingWrapper loading={submitting}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surfaceVariant }}>
        <Surface style={{ margin: spacing.md, padding: spacing.lg, borderRadius: theme.roundness, backgroundColor: theme.colors.surface }}>
          <Text variant="headlineMedium" style={{ marginBottom: spacing.sm }}>
            {t("auth.setPassword")}
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: spacing.lg, color: theme.colors.onSurfaceVariant }}>
            {firstName ? `${t("auth.welcomeBack")}, ${firstName}. ${t("auth.setPasswordInstructions")}` : t("auth.setPasswordInstructions")}
          </Text>

          <TextInput
            mode="outlined"
            label={t("auth.newPassword")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface }}
            left={<TextInput.Icon icon="lock" />}
            right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(v => !v)} />}
          />
          <TextInput
            mode="outlined"
            label={t("auth.verifyPassword")}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface }}
            left={<TextInput.Icon icon="lock-check" />}
          />

          <Button mode="contained" onPress={submit} loading={submitting} disabled={submitting || !password || !confirm} style={{ marginTop: spacing.sm }}>
            {submitting ? t("auth.savingPassword") : t("auth.signIn")}
          </Button>
        </Surface>
      </SafeAreaView>
    </LoadingWrapper>
  );
};

export default SetPassword;

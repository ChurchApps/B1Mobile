import React, { useState } from "react";
import { Alert, SafeAreaView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Surface, Text, TextInput } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/theme";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { ApiHelper } from "../../src/helpers";

const Forgot = () => {
  const { t } = useTranslation();
  const { theme, spacing } = useAppTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email || "");
  const [submitting, setSubmitting] = useState(false);

  const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,6})+$/;

  const submit = async () => {
    if (!email) {
      Alert.alert(t("common.alert"), t("auth.enterEmail"));
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      Alert.alert(t("common.alert"), t("auth.invalidEmail"));
      return;
    }
    setSubmitting(true);
    try {
      const resp: any = await ApiHelper.postAnonymous("/users/forgot", { userEmail: email }, "MembershipApi");
      if (resp?.emailed) {
        router.replace({ pathname: "/auth/verify", params: { email } });
      } else {
        Alert.alert(t("common.alert"), t("auth.noAccountFound"));
      }
    } catch (e: any) {
      Alert.alert(t("common.alert"), e?.message || t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LoadingWrapper loading={submitting}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surfaceVariant }}>
        <Surface style={{ margin: spacing.md, padding: spacing.lg, borderRadius: theme.roundness, backgroundColor: theme.colors.surface }}>
          <Text variant="headlineMedium" style={{ marginBottom: spacing.sm }}>
            {t("auth.resetPassword")}
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: spacing.lg, color: theme.colors.onSurfaceVariant }}>
            {t("auth.resetInstructions")}
          </Text>

          <TextInput
            mode="outlined"
            label={t("auth.email")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface }}
            left={<TextInput.Icon icon="email" />}
          />

          <Button mode="contained" onPress={submit} loading={submitting} disabled={submitting} style={{ marginTop: spacing.sm }}>
            {submitting ? t("auth.sending") : t("auth.sendCode")}
          </Button>
          <Button mode="text" onPress={() => router.replace("/auth/login")} disabled={submitting}>
            {t("auth.backToSignIn")}
          </Button>
        </Surface>
      </SafeAreaView>
    </LoadingWrapper>
  );
};

export default Forgot;

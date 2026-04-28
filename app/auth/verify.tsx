import React, { useEffect, useRef, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, TextInput as RNTextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Surface, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/theme";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { ApiHelper } from "../../src/helpers";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

const Verify = () => {
  const { t } = useTranslation();
  const { theme, spacing } = useAppTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email || "";

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputsRef = useRef<Array<RNTextInput | null>>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const updateDigit = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    const next = [...digits];
    if (cleaned.length === 0) {
      next[index] = "";
      setDigits(next);
      return;
    }
    if (cleaned.length === 1) {
      next[index] = cleaned;
      setDigits(next);
      if (index < CODE_LENGTH - 1) inputsRef.current[index + 1]?.focus();
      if (next.every(d => d !== "")) submit(next.join(""));
    } else {
      for (let i = 0; i < cleaned.length && index + i < CODE_LENGTH; i++) {
        next[index + i] = cleaned[i];
      }
      setDigits(next);
      const focusAt = Math.min(index + cleaned.length, CODE_LENGTH - 1);
      inputsRef.current[focusAt]?.focus();
      if (next.every(d => d !== "")) submit(next.join(""));
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      inputsRef.current[index - 1]?.focus();
    }
  };

  const submit = async (codeOverride?: string) => {
    const code = codeOverride ?? digits.join("");
    if (code.length !== CODE_LENGTH) {
      Alert.alert(t("common.alert"), t("auth.enterCodeValidate"));
      return;
    }
    setSubmitting(true);
    try {
      const resp: any = await ApiHelper.postAnonymous("/users/verifyCode", { email, code }, "MembershipApi");
      if (resp?.authGuid) {
        router.replace({ pathname: "/auth/setPassword", params: { authGuid: resp.authGuid, email } });
      } else {
        const message = Array.isArray(resp?.errors) && resp.errors.length ? String(resp.errors[0]) : t("auth.invalidCode");
        Alert.alert(t("common.alert"), message);
        clearCode();
      }
    } catch (e: any) {
      Alert.alert(t("common.alert"), e?.message || t("auth.invalidCode"));
      clearCode();
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (resendCooldown > 0 || submitting) return;
    setSubmitting(true);
    clearCode();
    try {
      await ApiHelper.postAnonymous("/users/forgot", { userEmail: email }, "MembershipApi");
      Alert.alert(t("common.alert"), t("auth.codeResent"));
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (e: any) {
      Alert.alert(t("common.alert"), e?.message || t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const clearCode = () => {
    setDigits(Array(CODE_LENGTH).fill(""));
    inputsRef.current[0]?.focus();
  };

  return (
    <LoadingWrapper loading={submitting}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surfaceVariant }}>
        <Surface style={{ margin: spacing.md, padding: spacing.lg, borderRadius: theme.roundness, backgroundColor: theme.colors.surface }}>
          <Text variant="headlineMedium" style={{ marginBottom: spacing.sm }}>
            {t("auth.enterCode")}
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: spacing.lg, color: theme.colors.onSurfaceVariant }}>
            {t("auth.codeInstructions", { email })}
          </Text>

          <View style={styles.codeRow}>
            {digits.map((digit, index) => (
              <RNTextInput
                key={index}
                ref={el => { inputsRef.current[index] = el; }}
                value={digit}
                onChangeText={raw => updateDigit(index, raw)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={CODE_LENGTH}
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                editable={!submitting}
                style={[
                  styles.codeBox,
                  {
                    borderColor: digit ? theme.colors.primary : theme.colors.outline,
                    color: theme.colors.onSurface,
                    backgroundColor: theme.colors.surface
                  }
                ]}
              />
            ))}
          </View>

          <Button mode="contained" onPress={() => submit()} loading={submitting} disabled={submitting || digits.some(d => d === "")} style={{ marginTop: spacing.lg }}>
            {submitting ? t("auth.verifying") : t("auth.verifyCode")}
          </Button>

          <Button mode="text" onPress={resend} disabled={resendCooldown > 0 || submitting} style={{ marginTop: spacing.sm }}>
            {resendCooldown > 0 ? t("auth.resendCooldown", { seconds: resendCooldown }) : t("auth.resendCode")}
          </Button>

          <Button mode="text" onPress={() => router.replace("/auth/login")} disabled={submitting}>
            {t("auth.backToSignIn")}
          </Button>
        </Surface>
      </SafeAreaView>
    </LoadingWrapper>
  );
};

const styles = StyleSheet.create({
  codeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8
  },
  codeBox: {
    width: 44,
    height: 52,
    borderWidth: 1,
    borderRadius: 6,
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center"
  }
});

export default Verify;

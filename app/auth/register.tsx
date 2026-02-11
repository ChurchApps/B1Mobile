import React from "react";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { ApiHelper } from "../../src/helpers";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView } from "react-native";
import { Button, Text, TextInput, Surface } from "react-native-paper";
import { useAppTheme } from "../../src/theme";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { t } = useTranslation();
  const { theme, spacing } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const registerApiCall = async () => {
    setLoading(true);
    try {
      const data = await ApiHelper.postAnonymous("/users/register", { email, firstName, lastName }, "MembershipApi");
      if (data.email != null) {
        Alert.alert(t("common.alert"), t("auth.registrationSuccess"), [{ text: "OK", onPress: () => router.navigate("/auth/login") }]);
      } else {
        Alert.alert(t("common.error"), t("auth.userExists"));
      }
    } catch (error: any) {
      if (error.message && error.message.includes("user already exists")) {
        Alert.alert(t("common.error"), t("auth.userExists"));
      } else {
        Alert.alert(t("common.error"), error.message || t("common.error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const validateDetails = () => {
    let result = true;
    if (email != "") {
      const emailReg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,6})+$/;
      if (emailReg.test(email) === false) {
        Alert.alert(t("common.alert"), t("auth.invalidEmail"));
        result = false;
      } else if (firstName === "") {
        Alert.alert(t("common.alert"), t("auth.enterFirstName"));
        result = false;
      } else if (lastName === "") {
        Alert.alert(t("common.alert"), t("auth.enterLastName"));
        result = false;
      }
    } else {
      Alert.alert(t("common.alert"), t("auth.enterEmail"));
      result = false;
    }
    return result;
  };

  const getForm = () => (
    <>
      <Text variant="headlineMedium" style={{ marginBottom: spacing.md }}>
        {t("auth.registerAccount")}
      </Text>

      <TextInput mode="outlined" label={t("auth.firstName")} value={firstName} onChangeText={setFirstName} autoCorrect={false} style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface }} left={<TextInput.Icon icon="account" />} />

      <TextInput mode="outlined" label={t("auth.lastName")} value={lastName} onChangeText={setLastName} autoCorrect={false} style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface }} left={<TextInput.Icon icon="account" />} />

      <TextInput mode="outlined" label={t("auth.email")} value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface }} left={<TextInput.Icon icon="email" />} />

      <Text variant="bodySmall" style={{ marginBottom: spacing.md }}>
        {t("auth.privacyConfirm")}{" "}
        <Text variant="bodySmall" style={{ color: theme.colors.primary }} onPress={() => router.navigate("/auth/privacy")}>
          {t("auth.privacyPolicy").toLowerCase()}.
        </Text>
      </Text>

      <Button mode="contained" onPress={() => validateDetails() && registerApiCall()} loading={loading} style={{ marginBottom: spacing.md }}>
        {t("auth.register")}
      </Button>
    </>
  );

  const getContent = () => getForm();

  return (
    <LoadingWrapper loading={loading}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surfaceVariant }}>
        <Surface style={{ margin: spacing.md, padding: spacing.lg, borderRadius: theme.roundness, backgroundColor: theme.colors.surface }}>{getContent()}</Surface>
      </SafeAreaView>
    </LoadingWrapper>
  );
};

export default Register;

import React from "react";
import { useThemeColors } from "@/theme";
import { ApiHelper, EnvironmentHelper, LoginResponseInterface, CheckEmailResponseInterface } from "../../src/helpers";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Linking, SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity } from "react-native";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { useUserStore, useCurrentChurch, useChurchAppearance } from "../../src/stores/useUserStore";
import { OptimizedImage } from "../../src/components/OptimizedImage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const tc = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Get current church data if available
  const currentChurch = useCurrentChurch();
  const churchAppearance = useChurchAppearance();

  const validateDetails = () => {
    if (email != "") {
      const emailReg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,6})+$/;
      if (emailReg.test(email) === false) {
        Alert.alert(t("common.alert"), t("auth.invalidEmail"));
        return false;
      } else {
        if (password != "") {
          return true;
        } else {
          Alert.alert(t("common.alert"), t("auth.enterPassword"));
          return false;
        }
      }
    } else {
      Alert.alert(t("common.alert"), t("auth.enterEmail"));
      return false;
    }
  };

  const handleLoginFailure = async () => {
    try {
      const resp: CheckEmailResponseInterface = await ApiHelper.postAnonymous("/users/checkEmail", { email }, "MembershipApi");
      if (resp.exists) {
        Alert.alert(t("common.alert"), t("auth.invalidLogin"));
      } else {
        const params: any = { email };
        if (resp.peopleMatches.length === 1) {
          params.firstName = resp.peopleMatches[0].firstName;
          params.lastName = resp.peopleMatches[0].lastName;
          params.churchId = resp.peopleMatches[0].churchId;
          params.churchName = resp.peopleMatches[0].churchName;
        } else if (resp.peopleMatches.length > 1) {
          params.firstName = resp.peopleMatches[0].firstName;
          params.lastName = resp.peopleMatches[0].lastName;
        }
        Alert.alert(t("common.alert"), t("auth.noAccountFound"), [
          { text: t("auth.register"), onPress: () => router.navigate({ pathname: "/auth/register", params }) },
          { text: "OK" }
        ]);
      }
    } catch {
      Alert.alert(t("common.alert"), t("auth.invalidLogin"));
    }
  };

  const loginApiCall = () => {
    const params = { email: email, password: password };
    setLoading(true);
    ApiHelper.postAnonymous("/users/login", params, "MembershipApi")
      .then(async (data: LoginResponseInterface) => {
        if (data.user != null) {
          await useUserStore.getState().handleLogin(data as any);
          setLoading(false);
          router.replace("/(drawer)/dashboard");
        } else {
          setLoading(false);
          handleLoginFailure();
        }
      })
      .catch(() => {
        setLoading(false);
        handleLoginFailure();
      });
  };

  const forgotLink = EnvironmentHelper.B1WebRoot.replace("{subdomain}.", "") + "/login?action=forgot";

  return (
    <LoadingWrapper loading={loading}>
      <View style={[styles.container, { backgroundColor: tc.background }]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SafeAreaView style={styles.safeArea}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Card style={styles.heroCard}>
                <LinearGradient colors={["#0D47A1", "#2196F3"]} style={styles.heroGradient}>
                  <View style={styles.heroContent}>
                    {currentChurch ? (
                      <>
                        {churchAppearance?.logoLight ? (
                          <View style={[styles.churchLogoContainer, { backgroundColor: tc.surface }]}>
                            <OptimizedImage source={{ uri: churchAppearance.logoLight }} style={styles.churchLogo} contentFit="contain" priority="high" />
                          </View>
                        ) : (
                          <MaterialIcons name="church" size={48} color="#FFFFFF" style={styles.heroIcon} />
                        )}
                        <Text variant="headlineMedium" style={styles.heroTitle}>
                          {t("auth.welcomeBack")}
                        </Text>
                        <Text variant="bodyLarge" style={styles.heroSubtitle}>
                          {t("auth.signInTo", { churchName: currentChurch.name })}
                        </Text>
                      </>
                    ) : (
                      <>
                        <OptimizedImage source={require("../../src/assets/images/logoWhite.png")} style={styles.b1Logo} contentFit="contain" priority="high" />
                        <Text variant="headlineMedium" style={styles.heroTitle}>
                          {t("auth.welcomeToB1")}
                        </Text>
                        <Text variant="bodyLarge" style={styles.heroSubtitle}>
                          {t("auth.signInToAccess")}
                        </Text>
                      </>
                    )}
                  </View>
                </LinearGradient>
              </Card>
            </View>

            {/* Login Form */}
            <View style={styles.formSection}>
              <Card style={[styles.formCard, { backgroundColor: tc.surface }]}>
                <Card.Content style={styles.formContent}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      mode="outlined"
                      label={t("auth.emailLabel")}
                      placeholder={t("auth.emailPlaceholder")}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      keyboardType="email-address"
                      style={[styles.input, { backgroundColor: tc.surface }]}
                      left={<TextInput.Icon icon="email" />}
                      accessibilityLabel="Email address"
                    />

                    <TextInput
                      mode="outlined"
                      label={t("auth.passwordLabel")}
                      placeholder={t("auth.passwordPlaceholder")}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password"
                      textContentType="password"
                      style={[styles.input, { backgroundColor: tc.surface }]}
                      left={<TextInput.Icon icon="lock" />}
                      right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
                      accessibilityLabel="Password"
                    />
                  </View>

                  <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => Linking.openURL(forgotLink)} accessibilityLabel="Forgot password" accessibilityRole="link">
                    <Text variant="bodyMedium" style={[styles.forgotPasswordText, { color: tc.primary }]}>
                      {t("auth.forgotPassword")}
                    </Text>
                  </TouchableOpacity>

                  <Button mode="contained" onPress={() => validateDetails() && loginApiCall()} loading={loading} style={styles.loginButton} labelStyle={styles.loginButtonText} disabled={loading} accessibilityLabel="Sign in">
                    {t("auth.signIn")}
                  </Button>

                  <View style={styles.privacySection}>
                    <Text variant="bodySmall" style={[styles.privacyText, { color: tc.textSecondary }]}>
                      {t("auth.privacyConsent")}{" "}
                      <Text variant="bodySmall" style={[styles.privacyLink, { color: tc.primary }]} onPress={() => router.navigate("/auth/privacy")}>
                        {t("auth.privacyPolicy")}
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.registerSection}>
                    <Text variant="bodyMedium" style={[styles.registerText, { color: tc.text }]}>
                      {t("auth.noAccount")}{" "}
                      <Text variant="bodyMedium" style={[styles.registerLink, { color: tc.primary }]} onPress={() => router.navigate("/auth/register")} accessibilityLabel="Create an account" accessibilityRole="link">
                        {t("auth.register")}
                      </Text>
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </View>

            {/* Help Section */}
            {!currentChurch && (
              <View style={styles.helpSection}>
                <Card style={[styles.helpCard, { backgroundColor: tc.surface }]}>
                  <Card.Content style={styles.helpContent}>
                    <MaterialIcons name="help-outline" size={32} color="#9E9E9E" style={styles.helpIcon} />
                    <Text variant="titleMedium" style={[styles.helpTitle, { color: tc.text }]}>
                      {t("auth.newToB1")}
                    </Text>
                    <Text variant="bodyMedium" style={[styles.helpText, { color: tc.textSecondary }]}>
                      {t("auth.findChurchFirst")}
                    </Text>
                    <Button mode="outlined" onPress={() => router.navigate("/(drawer)/churchSearch")} style={styles.helpButton} labelStyle={styles.helpButtonText}>
                      {t("auth.findYourChurch")}
                    </Button>
                  </Card.Content>
                </Card>
              </View>
            )}
          </SafeAreaView>
        </ScrollView>
      </View>
    </LoadingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8" // Background from style guide
  },
  scrollView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32
  },
  safeArea: { flex: 1 },

  // Hero Section
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 24
  },
  heroCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  heroGradient: {
    padding: 32,
    minHeight: 180
  },
  heroContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  heroIcon: { marginBottom: 16 },
  churchLogoContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  churchLogo: {
    width: 160,
    height: 80
  },
  b1Logo: {
    width: 100,
    height: 40,
    marginBottom: 16
  },
  heroTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center"
  },
  heroSubtitle: {
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    paddingHorizontal: 16
  },

  // Form Section
  formSection: {
    paddingHorizontal: 16,
    marginBottom: 32
  },
  formCard: {
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  formContent: { padding: 24 },
  inputContainer: { marginBottom: 16 },
  input: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF"
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24
  },
  forgotPasswordText: {
    color: "#0D47A1",
    fontWeight: "500"
  },
  loginButton: {
    backgroundColor: "#0D47A1",
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: 24,
    elevation: 3,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16
  },
  privacySection: { alignItems: "center" },
  privacyText: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  },
  privacyLink: {
    color: "#0D47A1",
    fontWeight: "500"
  },
  registerSection: {
    alignItems: "center",
    marginTop: 16
  },
  registerText: {
    color: "#3c3c3c",
    textAlign: "center"
  },
  registerLink: {
    color: "#0D47A1",
    fontWeight: "600"
  },

  // Help Section
  helpSection: {
    paddingHorizontal: 16,
    marginBottom: 32
  },
  helpCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  helpContent: {
    alignItems: "center",
    padding: 24
  },
  helpIcon: { marginBottom: 16 },
  helpTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center"
  },
  helpText: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20
  },
  helpButton: {
    borderColor: "#0D47A1",
    borderRadius: 8
  },
  helpButtonText: {
    color: "#0D47A1",
    fontWeight: "600"
  }
});

export default Login;

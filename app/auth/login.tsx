import React from "react";
import { ApiHelper, EnvironmentHelper, LoginResponseInterface } from "../../src/helpers";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Linking, SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity } from "react-native";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { TextInput, Button, Text, Provider as PaperProvider, MD3LightTheme, Card } from "react-native-paper";
import { useUserStore, useCurrentChurch, useChurchAppearance } from "../../src/stores/useUserStore";
import { OptimizedImage } from "../../src/components/OptimizedImage";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#0D47A1",
    secondary: "#f0f2f5",
    surface: "#ffffff",
    background: "#F6F6F8",
    onSurface: "#3c3c3c",
    onBackground: "#3c3c3c",
    elevation: {
      level0: "transparent",
      level1: "#ffffff",
      level2: "#f8f9fa",
      level3: "#f0f2f5",
      level4: "#e9ecef",
      level5: "#e2e6ea"
    }
  }
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Get current church data if available
  const currentChurch = useCurrentChurch();
  const churchAppearance = useChurchAppearance();

  const validateDetails = () => {
    if (email != "") {
      let emailReg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,6})+$/;
      if (emailReg.test(email) === false) {
        Alert.alert("Alert", "Please enter valid email.");
        return false;
      } else {
        if (password != "") {
          return true;
        } else {
          Alert.alert("Alert", "Please enter password.");
          return false;
        }
      }
    } else {
      Alert.alert("Alert", "Please enter email.");
      return false;
    }
  };

  const loginApiCall = () => {
    let params = { email: email, password: password };
    setLoading(true);
    ApiHelper.postAnonymous("/users/login", params, "MembershipApi")
      .then(async (data: LoginResponseInterface) => {
        if (data.user != null) {
          await useUserStore.getState().handleLogin(data as any);
          setLoading(false);
          router.replace("/(drawer)/dashboard");
        } else {
          setLoading(false);
          Alert.alert("Alert", "Invalid login");
        }
      })
      .catch(() => {
        setLoading(false);
        Alert.alert("Alert", "Invalid login");
      });
  };

  const forgotLink = EnvironmentHelper.B1WebRoot.replace("{subdomain}.", "") + "/login?action=forgot";

  return (
    <PaperProvider theme={theme}>
      <LoadingWrapper loading={loading}>
        <View style={styles.container}>
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
                            <View style={styles.churchLogoContainer}>
                              <OptimizedImage source={{ uri: churchAppearance.logoLight }} style={styles.churchLogo} contentFit="contain" priority="high" />
                            </View>
                          ) : (
                            <MaterialIcons name="church" size={48} color="#FFFFFF" style={styles.heroIcon} />
                          )}
                          <Text variant="headlineMedium" style={styles.heroTitle}>
                            Welcome Back
                          </Text>
                          <Text variant="bodyLarge" style={styles.heroSubtitle}>
                            Sign in to {currentChurch.name}
                          </Text>
                        </>
                      ) : (
                        <>
                          <OptimizedImage source={require("../../src/assets/images/logoWhite.png")} style={styles.b1Logo} contentFit="contain" priority="high" />
                          <Text variant="headlineMedium" style={styles.heroTitle}>
                            Welcome to B1
                          </Text>
                          <Text variant="bodyLarge" style={styles.heroSubtitle}>
                            Sign in to access your church community
                          </Text>
                        </>
                      )}
                    </View>
                  </LinearGradient>
                </Card>
              </View>

              {/* Login Form */}
              <View style={styles.formSection}>
                <Card style={styles.formCard}>
                  <Card.Content style={styles.formContent}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        mode="outlined"
                        label="Email Address"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        style={styles.input}
                        left={<TextInput.Icon icon="email" />}
                        theme={{
                          colors: {
                            primary: "#0D47A1",
                            outline: "rgba(0, 0, 0, 0.12)"
                          }
                        }}
                      />

                      <TextInput
                        mode="outlined"
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={styles.input}
                        left={<TextInput.Icon icon="lock" />}
                        right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
                        theme={{
                          colors: {
                            primary: "#0D47A1",
                            outline: "rgba(0, 0, 0, 0.12)"
                          }
                        }}
                      />
                    </View>

                    <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => Linking.openURL(forgotLink)}>
                      <Text variant="bodyMedium" style={styles.forgotPasswordText}>
                        Forgot your password?
                      </Text>
                    </TouchableOpacity>

                    <Button mode="contained" onPress={() => validateDetails() && loginApiCall()} loading={loading} style={styles.loginButton} labelStyle={styles.loginButtonText} disabled={loading}>
                      Sign In
                    </Button>

                    <View style={styles.privacySection}>
                      <Text variant="bodySmall" style={styles.privacyText}>
                        By signing in, you agree to our{" "}
                        <Text variant="bodySmall" style={styles.privacyLink} onPress={() => router.navigate("/auth/privacy")}>
                          Privacy Policy
                        </Text>
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </View>

              {/* Help Section */}
              {!currentChurch && (
                <View style={styles.helpSection}>
                  <Card style={styles.helpCard}>
                    <Card.Content style={styles.helpContent}>
                      <MaterialIcons name="help-outline" size={32} color="#9E9E9E" style={styles.helpIcon} />
                      <Text variant="titleMedium" style={styles.helpTitle}>
                        New to B1?
                      </Text>
                      <Text variant="bodyMedium" style={styles.helpText}>
                        First, find and select your church, then create your account or sign in.
                      </Text>
                      <Button mode="outlined" onPress={() => router.navigate("/(drawer)/churchSearch")} style={styles.helpButton} labelStyle={styles.helpButtonText}>
                        Find Your Church
                      </Button>
                    </Card.Content>
                  </Card>
                </View>
              )}
            </SafeAreaView>
          </ScrollView>
        </View>
      </LoadingWrapper>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8" // Background from style guide
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32
  },
  safeArea: {
    flex: 1
  },

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
  heroIcon: {
    marginBottom: 16
  },
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
  formContent: {
    padding: 24
  },
  inputContainer: {
    marginBottom: 16
  },
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
  privacySection: {
    alignItems: "center"
  },
  privacyText: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  },
  privacyLink: {
    color: "#0D47A1",
    fontWeight: "500"
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
  helpIcon: {
    marginBottom: 16
  },
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

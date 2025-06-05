import React from "react";
import { BlueHeader } from "@/src/components/BlueHeader";
import { ApiHelper, EnvironmentHelper, LoginResponseInterface, UserHelper } from "@/src/helpers";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Linking, SafeAreaView, ScrollView, View } from "react-native";
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";
import { TextInput, Button, Text, Surface } from "react-native-paper";
import { useAppTheme } from "@/src/theme";

const Login = () => {
  const { theme, spacing } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        setLoading(false);
        console.log("Called login");
        if (data.user != null) {
          console.log("Login successful", data);
          await UserHelper.handleLogin(data as any);
          console.log("handled Login.  Restarting");

          // router.replace('(drawer)/dashboard');
          // props.navigation.reset({
          //   index: 0,
          //   routes: [{ name: 'MainStack' }]
          // }, 500)
          //DevSettings.reload();
          router.navigate("/"); //Expo seems to remember the page you were on.
          //RNRestart.Restart();
        } else Alert.alert("Alert", "Invalid login");
      })
      .catch(() => {
        setLoading(false);
        Alert.alert("Alert", "Invalid login");
      });
  };

  const forgotLink = EnvironmentHelper.B1WebRoot.replace("{subdomain}.", "") + "/login?action=forgot";

  return (
    <LoadingWrapper loading={loading}>
      <View style={{ flex: 1, backgroundColor: theme.colors.surfaceVariant }}>
        <ScrollView>
          <SafeAreaView style={{ flex: 1 }}>
            <BlueHeader />
            <Surface style={{ margin: spacing.md, padding: spacing.lg, borderRadius: theme.roundness, backgroundColor: theme.colors.surface }}>
              <Text variant="headlineMedium" style={{ marginBottom: spacing.md }}>
                Welcome, Please Login.
              </Text>

              <TextInput
                mode="outlined"
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface }}
                left={<TextInput.Icon icon="email" />}
              />

              <TextInput
                mode="outlined"
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface }}
                left={<TextInput.Icon icon="lock" />}
                right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
              />

              <Text variant="bodySmall" style={{ marginBottom: spacing.md }}>
                By clicking on Login, I confirm that I have read the{" "}
                <Text variant="bodySmall" style={{ color: theme.colors.primary }} onPress={() => router.navigate("/auth/privacy")}>
                  privacy policy.
                </Text>
              </Text>

              <Button mode="contained" onPress={() => validateDetails() && loginApiCall()} loading={loading} style={{ marginBottom: spacing.md }}>
                Login
              </Button>

              <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <Button mode="text" onPress={() => Linking.openURL(forgotLink)}>
                  Forgot Password
                </Button>
              </View>
            </Surface>
          </SafeAreaView>
        </ScrollView>
      </View>
    </LoadingWrapper>
  );
};

export default Login;

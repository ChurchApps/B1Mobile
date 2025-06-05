import React from "react";
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView } from "react-native";
import { Button, Text, TextInput, Surface } from "react-native-paper";
import { useAppTheme } from "@/src/theme";

const Register = () => {
  const { theme, spacing } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const registerApiCall = async () => {
    setLoading(true);
    try {
      /*
      const data = await ApiHelper.post("/users/register", { email, firstName, lastName }, "MembershipApi");
      if (data.email != null) setRegistered(true);
      else Alert.alert("Alert", "User already exists.");
      */
    } catch (error: any) {
      if (error.message && error.message.includes("user already exists")) {
        Alert.alert("Error", "This user already exists. Please log in with your username and password.");
      } else {
        Alert.alert("Error", error.message || "Failed to register user");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateDetails = () => {
    let result = true;
    if (email != "") {
      let emailReg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,6})+$/;
      if (emailReg.test(email) === false) {
        Alert.alert("Alert", "Please enter valid email.");
        result = false;
      } else if (firstName === "") {
        Alert.alert("Alert", "Please enter first name.");
        result = false;
      } else if (lastName === "") {
        Alert.alert("Alert", "Please enter last name.");
        result = false;
      }
    } else {
      Alert.alert("Alert", "Please enter email.");
      result = false;
    }
    return result;
  };

  const getForm = () => (
    <>
      <Text variant="headlineMedium" style={{ marginBottom: spacing.md }}>
        Register an Account
      </Text>

      <TextInput
        mode="outlined"
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        autoCorrect={false}
        style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface }}
        left={<TextInput.Icon icon="account" />}
      />

      <TextInput
        mode="outlined"
        label="Last name"
        value={lastName}
        onChangeText={setLastName}
        autoCorrect={false}
        style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface }}
        left={<TextInput.Icon icon="account" />}
      />

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

      <Text variant="bodySmall" style={{ marginBottom: spacing.md }}>
        By clicking on Register, I confirm that I have read the{" "}
        <Text variant="bodySmall" style={{ color: theme.colors.primary }} onPress={() => router.navigate("/auth/privacy")}>
          privacy policy.
        </Text>
      </Text>

      <Button mode="contained" onPress={() => validateDetails() && registerApiCall()} loading={loading} style={{ marginBottom: spacing.md }}>
        Register
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

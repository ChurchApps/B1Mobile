import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { useMutation } from "@tanstack/react-query";
import { ApiHelper } from "@churchapps/helpers";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { FormField } from "../common/FormField";
import { useUser, useUserStore } from "../../stores/useUserStore";
import { SecureStorageHelper } from "../../helpers/SecureStorageHelper";

export const AccountSettings: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();

  // Display Name state
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");

  // Email state
  const [newEmail, setNewEmail] = useState("");

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation state
  const [nameErrors, setNameErrors] = useState<{ firstName?: string; lastName?: string }>({});
  const [emailErrors, setEmailErrors] = useState<{ email?: string }>({});
  const [passwordErrors, setPasswordErrors] = useState<{
    new?: string;
    confirm?: string;
  }>({});

  // Display Name mutation
  const nameMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
      return ApiHelper.post("/users/setDisplayName", data, "MembershipApi");
    },
    onSuccess: () => {
      // Update local user state
      const currentUser = useUserStore.getState().user;
      if (currentUser) {
        useUserStore.getState().setUser({
          ...currentUser,
          firstName,
          lastName
        });
      }
      Alert.alert(t("common.success"), t("profileEdit.nameUpdated"));
    },
    onError: (error: any) => {
      Alert.alert(t("common.error"), error.message || t("profileEdit.updateFailed"));
    }
  });

  // Email mutation
  const emailMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      return ApiHelper.post("/users/updateEmail", data, "MembershipApi");
    },
    onSuccess: async (response: any) => {
      // Update local user state with new email
      const currentUser = useUserStore.getState().user;
      if (currentUser) {
        useUserStore.getState().setUser({
          ...currentUser,
          email: newEmail
        });
      }

      // If a new JWT was returned, update it
      if (response?.jwt) {
        await SecureStorageHelper.setSecureItem("default_jwt", response.jwt);
        ApiHelper.setDefaultPermissions(response.jwt);
      }

      setNewEmail("");
      Alert.alert(t("common.success"), t("profileEdit.emailUpdated"));
    },
    onError: (error: any) => {
      Alert.alert(t("common.error"), error.message || t("profileEdit.updateFailed"));
    }
  });

  // Password mutation
  const passwordMutation = useMutation({
    mutationFn: async (data: { newPassword: string }) => {
      return ApiHelper.post("/users/updatePassword", data, "MembershipApi");
    },
    onSuccess: () => {
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert(t("common.success"), t("profileEdit.passwordUpdated"));
    },
    onError: (error: any) => {
      Alert.alert(t("common.error"), error.message || t("profileEdit.updateFailed"));
    }
  });

  const validateName = (): boolean => {
    const errors: { firstName?: string; lastName?: string } = {};
    if (!firstName.trim()) errors.firstName = t("auth.enterFirstName");
    if (!lastName.trim()) errors.lastName = t("auth.enterLastName");
    setNameErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEmail = (): boolean => {
    const errors: { email?: string } = {};
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!newEmail.trim()) errors.email = t("auth.enterEmail");
    else if (!emailRegex.test(newEmail)) errors.email = t("auth.invalidEmail");
    setEmailErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = (): boolean => {
    const errors: { new?: string; confirm?: string } = {};
    if (!newPassword) errors.new = t("auth.enterPassword");
    else if (newPassword.length < 8) errors.new = t("profileEdit.passwordRequirements");
    if (!confirmPassword) errors.confirm = t("auth.enterPassword");
    else if (newPassword !== confirmPassword) errors.confirm = t("profileEdit.passwordsMustMatch");
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveName = () => {
    if (validateName()) {
      nameMutation.mutate({ firstName: firstName.trim(), lastName: lastName.trim() });
    }
  };

  const handleSaveEmail = () => {
    if (validateEmail()) {
      emailMutation.mutate({ email: newEmail.trim() });
    }
  };

  const handleSavePassword = () => {
    if (validatePassword()) {
      passwordMutation.mutate({ newPassword });
    }
  };

  const hasNameChanges = firstName !== (user?.firstName || "") || lastName !== (user?.lastName || "");

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Display Name Section */}
      <Card style={styles.section}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={24} color="#0D47A1" />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t("profileEdit.displayName")}
            </Text>
          </View>

          <FormField
            label={t("profileEdit.firstName")}
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              setNameErrors({});
            }}
            error={nameErrors.firstName}
            autoCapitalize="words"
          />

          <FormField
            label={t("profileEdit.lastName")}
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              setNameErrors({});
            }}
            error={nameErrors.lastName}
            autoCapitalize="words"
          />

          {hasNameChanges && (
            <Button
              mode="contained"
              onPress={handleSaveName}
              loading={nameMutation.isPending}
              disabled={nameMutation.isPending}
              style={styles.saveButton}
              buttonColor="#0D47A1"
              textColor="#FFFFFF">
              {t("common.save")}
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Email Section */}
      <Card style={styles.section}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="email" size={24} color="#0D47A1" />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t("profileEdit.changeEmail")}
            </Text>
          </View>

          <Text variant="bodySmall" style={styles.currentValue}>
            {t("profileEdit.email")}: {user?.email}
          </Text>

          <FormField
            label={t("profileEdit.newEmail")}
            value={newEmail}
            onChangeText={(text) => {
              setNewEmail(text);
              setEmailErrors({});
            }}
            type="email"
            error={emailErrors.email}
          />

          <Button
            mode="contained"
            onPress={handleSaveEmail}
            loading={emailMutation.isPending}
            disabled={emailMutation.isPending || !newEmail}
            style={styles.saveButton}
            buttonColor="#0D47A1"
            textColor="#FFFFFF">
            {t("common.save")}
          </Button>
        </Card.Content>
      </Card>

      {/* Password Section */}
      <Card style={styles.section}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="lock" size={24} color="#0D47A1" />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t("profileEdit.changePassword")}
            </Text>
          </View>

          <FormField
            label={t("profileEdit.newPassword")}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setPasswordErrors({});
            }}
            type="password"
            error={passwordErrors.new}
          />

          <FormField
            label={t("profileEdit.confirmPassword")}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setPasswordErrors({});
            }}
            type="password"
            error={passwordErrors.confirm}
          />

          <Text variant="bodySmall" style={styles.hint}>
            {t("profileEdit.passwordRequirements")}
          </Text>

          <Button
            mode="contained"
            onPress={handleSavePassword}
            loading={passwordMutation.isPending}
            disabled={passwordMutation.isPending || !newPassword || !confirmPassword}
            style={styles.saveButton}
            buttonColor="#0D47A1"
            textColor="#FFFFFF">
            {t("common.save")}
          </Button>
        </Card.Content>
      </Card>

      {/* Bottom padding for scroll */}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  section: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 8
  },
  sectionTitle: {
    fontWeight: "600",
    color: "#3c3c3c"
  },
  currentValue: {
    color: "#9E9E9E",
    marginBottom: 16
  },
  hint: {
    color: "#9E9E9E",
    marginBottom: 8
  },
  saveButton: {
    marginTop: 8
  }
});

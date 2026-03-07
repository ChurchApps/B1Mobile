import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Card, Button, Switch } from "react-native-paper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiHelper } from "@churchapps/helpers";
import { VisibilityPreferenceInterface } from "../../interfaces";
import { LoadingWrapper } from "../wrapper/LoadingWrapper";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import DropDownPicker from "react-native-dropdown-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../theme";

type VisibilityOption = "everyone" | "members" | "groups";

export const VisibilitySettings: React.FC = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const currentUserChurch = useCurrentUserChurch();

  const [addressOpen, setAddressOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const [address, setAddress] = useState<VisibilityOption>("members");
  const [phoneNumber, setPhoneNumber] = useState<VisibilityOption>("members");
  const [email, setEmail] = useState<VisibilityOption>("members");

  const [hasChanges, setHasChanges] = useState(false);
  const [originalPrefs, setOriginalPrefs] = useState<VisibilityPreferenceInterface | null>(null);

  const [optedOut, setOptedOut] = useState(false);
  const [originalOptedOut, setOriginalOptedOut] = useState(false);

  const visibilityOptions = [
    { label: t("profileEdit.everyone"), value: "everyone" as VisibilityOption },
    { label: t("profileEdit.membersOnly"), value: "members" as VisibilityOption },
    { label: t("profileEdit.myGroupsOnly"), value: "groups" as VisibilityOption }
  ];

  const { data: preferences, isLoading } = useQuery<VisibilityPreferenceInterface>({
    queryKey: ["/visibilityPreferences/my", "MembershipApi"],
    enabled: !!currentUserChurch?.jwt,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

  useEffect(() => {
    if (preferences) {
      setAddress((preferences.address as VisibilityOption) || "members");
      setPhoneNumber((preferences.phoneNumber as VisibilityOption) || "members");
      setEmail((preferences.email as VisibilityOption) || "members");
      setOriginalPrefs(preferences);
    }
  }, [preferences]);

  useEffect(() => {
    if (currentUserChurch?.person) {
      const personOptedOut = currentUserChurch.person.optedOut || false;
      setOptedOut(personOptedOut);
      setOriginalOptedOut(personOptedOut);
    }
  }, [currentUserChurch?.person]);

  useEffect(() => {
    if (originalPrefs) {
      const prefsChanged =
        address !== (originalPrefs.address || "members") ||
        phoneNumber !== (originalPrefs.phoneNumber || "members") ||
        email !== (originalPrefs.email || "members");
      const optedOutChanged = optedOut !== originalOptedOut;
      setHasChanges(prefsChanged || optedOutChanged);
    }
  }, [address, phoneNumber, email, originalPrefs, optedOut, originalOptedOut]);

  const saveMutation = useMutation({
    mutationFn: async (prefs: VisibilityPreferenceInterface) => {
      return ApiHelper.post("/visibilityPreferences", [prefs], "MembershipApi");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/visibilityPreferences/my"] });
      setOriginalPrefs({ ...originalPrefs, address, phoneNumber, email });
    },
    onError: (error: any) => {
      Alert.alert(t("common.error"), error.message || t("profileEdit.visibilitySaveError"));
    }
  });

  const optedOutMutation = useMutation({
    mutationFn: async (newOptedOut: boolean) => {
      return ApiHelper.post("/users/updateOptedOut", { personId: currentUserChurch?.person?.id, optedOut: newOptedOut }, "MembershipApi");
    },
    onSuccess: () => {
      setOriginalOptedOut(optedOut);
    },
    onError: (error: any) => {
      Alert.alert(t("common.error"), error.message || t("profileEdit.visibilitySaveError"));
    }
  });

  const handleSave = async () => {
    const promises: Promise<any>[] = [];

    const prefsChanged =
      address !== (originalPrefs?.address || "members") ||
      phoneNumber !== (originalPrefs?.phoneNumber || "members") ||
      email !== (originalPrefs?.email || "members");

    if (prefsChanged) {
      promises.push(saveMutation.mutateAsync({
        ...preferences,
        address,
        phoneNumber,
        email
      }));
    }

    if (optedOut !== originalOptedOut) {
      promises.push(optedOutMutation.mutateAsync(optedOut));
    }

    try {
      await Promise.all(promises);
      Alert.alert(t("common.success"), t("profileEdit.visibilitySaved"));
      setHasChanges(false);
    } catch {
      // Error already handled by individual mutations
    }
  };

  return (
    <LoadingWrapper loading={isLoading}>
      <View style={styles.container}>
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
              <MaterialIcons name="visibility" size={24} color={colors.primary} />
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
                {t("profileEdit.visibilityPreferences")}
              </Text>
            </View>

            <Text variant="bodyMedium" style={[styles.description, { color: colors.disabled }]}>
              {t("profileEdit.visibilityDescription")}
            </Text>

            {/* Hide from Directory */}
            <View style={[styles.switchContainer, { borderBottomColor: colors.border }]}>
              <Text variant="bodyMedium" style={[styles.switchLabel, { color: colors.text }]}>
                {t("profileEdit.hideFromDirectory")}
              </Text>
              <Switch
                value={optedOut}
                onValueChange={setOptedOut}
                color={colors.primary}
              />
            </View>

            {/* Address Visibility */}
            <View style={[styles.dropdownContainer, { zIndex: 3000 }]}>
              <Text variant="labelLarge" style={[styles.dropdownLabel, { color: colors.text }]}>
                {t("profileEdit.addressVisibility")}
              </Text>
              <DropDownPicker
                open={addressOpen}
                value={address}
                items={visibilityOptions}
                setOpen={setAddressOpen}
                setValue={setAddress}
                onOpen={() => {
                  setPhoneOpen(false);
                  setEmailOpen(false);
                }}
                style={[styles.dropdown, { borderColor: colors.divider, backgroundColor: colors.surface }]}
                dropDownContainerStyle={[styles.dropdownList, { borderColor: colors.divider, backgroundColor: colors.surface }]}
                textStyle={[styles.dropdownText, { color: colors.text }]}
                listMode="SCROLLVIEW"
              />
            </View>

            {/* Phone Visibility */}
            <View style={[styles.dropdownContainer, { zIndex: 2000 }]}>
              <Text variant="labelLarge" style={[styles.dropdownLabel, { color: colors.text }]}>
                {t("profileEdit.phoneVisibility")}
              </Text>
              <DropDownPicker
                open={phoneOpen}
                value={phoneNumber}
                items={visibilityOptions}
                setOpen={setPhoneOpen}
                setValue={setPhoneNumber}
                onOpen={() => {
                  setAddressOpen(false);
                  setEmailOpen(false);
                }}
                style={[styles.dropdown, { borderColor: colors.divider, backgroundColor: colors.surface }]}
                dropDownContainerStyle={[styles.dropdownList, { borderColor: colors.divider, backgroundColor: colors.surface }]}
                textStyle={[styles.dropdownText, { color: colors.text }]}
                listMode="SCROLLVIEW"
              />
            </View>

            {/* Email Visibility */}
            <View style={[styles.dropdownContainer, { zIndex: 1000 }]}>
              <Text variant="labelLarge" style={[styles.dropdownLabel, { color: colors.text }]}>
                {t("profileEdit.emailVisibility")}
              </Text>
              <DropDownPicker
                open={emailOpen}
                value={email}
                items={visibilityOptions}
                setOpen={setEmailOpen}
                setValue={setEmail}
                onOpen={() => {
                  setAddressOpen(false);
                  setPhoneOpen(false);
                }}
                style={[styles.dropdown, { borderColor: colors.divider, backgroundColor: colors.surface }]}
                dropDownContainerStyle={[styles.dropdownList, { borderColor: colors.divider, backgroundColor: colors.surface }]}
                textStyle={[styles.dropdownText, { color: colors.text }]}
                listMode="SCROLLVIEW"
              />
            </View>

            {hasChanges && (
              <Button
                mode="contained"
                onPress={handleSave}
                loading={saveMutation.isPending || optedOutMutation.isPending}
                disabled={saveMutation.isPending || optedOutMutation.isPending}
                style={[styles.saveButton, { backgroundColor: colors.primary }]}>
                {t("common.save")}
              </Button>
            )}
          </Card.Content>
        </Card>

        <Card style={[styles.infoCard, { backgroundColor: colors.iconBackground }]}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <MaterialIcons name="info-outline" size={20} color={colors.primary} />
              <Text variant="titleSmall" style={[styles.infoTitle, { color: colors.primary }]}>
                {t("profileEdit.visibilityLevels")}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="labelMedium" style={[styles.infoLabel, { color: colors.text }]}>
                {t("profileEdit.everyone")}:
              </Text>
              <Text variant="bodySmall" style={[styles.infoText, { color: colors.disabled }]}>
                {t("profileEdit.everyoneDescription")}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="labelMedium" style={[styles.infoLabel, { color: colors.text }]}>
                {t("profileEdit.membersOnly")}:
              </Text>
              <Text variant="bodySmall" style={[styles.infoText, { color: colors.disabled }]}>
                {t("profileEdit.membersDescription")}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="labelMedium" style={[styles.infoLabel, { color: colors.text }]}>
                {t("profileEdit.myGroupsOnly")}:
              </Text>
              <Text variant="bodySmall" style={[styles.infoText, { color: colors.disabled }]}>
                {t("profileEdit.groupsDescription")}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    </LoadingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  section: {
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    paddingBottom: 8
  },
  sectionTitle: {
    fontWeight: "600"
  },
  description: {
    marginBottom: 20
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 20
  },
  switchLabel: {
    flex: 1
  },
  dropdownContainer: { marginBottom: 20 },
  dropdownLabel: {
    marginBottom: 8,
    fontWeight: "600"
  },
  dropdown: {},
  dropdownList: {},
  dropdownText: {},
  saveButton: {
    marginTop: 8
  },
  infoCard: {},
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12
  },
  infoTitle: {
    fontWeight: "600"
  },
  infoItem: { marginBottom: 8 },
  infoLabel: {
    fontWeight: "600"
  },
  infoText: {
    marginTop: 2
  }
});

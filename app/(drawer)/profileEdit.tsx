import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { ApiHelper } from "@churchapps/helpers";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { useCurrentUserChurch } from "../../src/stores/useUserStore";
import { UserHelper } from "../../src/helpers";
import {
  ProfileTabBar,
  ProfileTabSection,
  ProfileEditForm,
  HouseholdEdit,
  VisibilitySettings,
  PendingChangesView,
  AccountSettings
} from "../../src/components/profile";
import {
  PersonInterface,
  ProfileChange,
  TaskInterface,
  fieldDefinitions
} from "../../src/interfaces";
import { useTranslation } from "react-i18next";
import { useFormWithDirtyTracking } from "../../src/hooks/useFormWithDirtyTracking";
import { useThemeColors } from "../../src/theme";

const ProfileEdit = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const currentUserChurch = useCurrentUserChurch();
  const person = currentUserChurch?.person;
  const isFocused = useIsFocused();

  const [activeTab, setActiveTab] = useState<ProfileTabSection>("profile");
  const [pendingFamilyMembers, setPendingFamilyMembers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getFieldValue = useCallback((obj: PersonInterface, key: string): string => {
    const parts = key.split(".");
    let value: any = obj;
    for (const part of parts) {
      value = value?.[part];
    }
    if (key === "birthDate" && value) {
      return new Date(value).toISOString().split("T")[0];
    }
    return value || "";
  }, []);

  const setFieldValue = useCallback((obj: PersonInterface, key: string, value: string): PersonInterface => {
    const newObj = JSON.parse(JSON.stringify(obj));
    const parts = key.split(".");
    let target: any = newObj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!target[parts[i]]) target[parts[i]] = {};
      target = target[parts[i]];
    }
    target[parts[parts.length - 1]] = value;
    return newObj;
  }, []);

  const form = useFormWithDirtyTracking<PersonInterface>({ getFieldValue, setFieldValue });
  const { editedData: editedPerson, setEditedData: setEditedPerson, modifiedFields, setModifiedFields, handleFieldChange } = form;

  // Fetch full person data
  const { data: personData, isLoading } = useQuery<PersonInterface>({
    queryKey: [`/people/${person?.id}`, "MembershipApi"],
    enabled: !!person?.id && !!currentUserChurch?.jwt && isFocused,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  useEffect(() => {
    UserHelper.addOpenScreenEvent("Profile Edit Screen");
  }, []);

  useEffect(() => {
    if (personData && !editedPerson) {
      form.initialize(personData);
    }
  }, [personData]);

  const handlePhotoChange = (photoUri: string) => {
    if (!editedPerson) return;
    setEditedPerson({ ...editedPerson, photo: photoUri });
    form.markFieldModified("photo");
  };

  const buildChanges = (): ProfileChange[] => {
    const changes: ProfileChange[] = [];

    modifiedFields.forEach((key) => {
      const fieldDef = fieldDefinitions.find((f) => f.key === key);
      if (fieldDef && editedPerson) {
        changes.push({
          field: key,
          label: fieldDef.label,
          value: key === "photo" ? editedPerson.photo || "" : form.getField(key)
        });
      }
    });

    pendingFamilyMembers.forEach((name) => {
      changes.push({
        field: "familyMember",
        label: t("profileEdit.addFamilyMember"),
        value: name
      });
    });

    return changes;
  };

  const handleSubmit = async () => {
    const changes = buildChanges();
    if (changes.length === 0) return;

    setIsSubmitting(true);

    try {
      const task: TaskInterface = {
        dateCreated: new Date(),
        associatedWithType: "person",
        associatedWithId: person?.id,
        associatedWithLabel: person?.name?.display,
        createdByType: "person",
        createdById: person?.id,
        createdByLabel: person?.name?.display,
        title: `Profile changes for ${person?.name?.display}`,
        status: "Open",
        data: JSON.stringify(changes)
      };

      // Check for approval group
      const publicSettings = await ApiHelper.get(
        `/settings/public/${currentUserChurch?.church?.id}`,
        "MembershipApi"
      );

      if (publicSettings?.directoryApprovalGroupId) {
        const group = await ApiHelper.get(
          `/groups/${publicSettings.directoryApprovalGroupId}`,
          "MembershipApi"
        );
        task.assignedToType = "group";
        task.assignedToId = publicSettings.directoryApprovalGroupId;
        task.assignedToLabel = group?.name;
      }

      await ApiHelper.post("/tasks?type=directoryUpdate", [task], "DoingApi");

      setSubmitted(true);
      setModifiedFields(new Set());
      setPendingFamilyMembers([]);
      Alert.alert(
        t("common.success"),
        t("profileEdit.changesSubmitted"),
        [{ text: t("common.ok"), onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error("Error submitting profile changes:", error);
      Alert.alert(t("common.error"), error.message || t("profileEdit.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (form.hasChanges || pendingFamilyMembers.length > 0) {
      Alert.alert(
        t("profileEdit.discardChanges"),
        t("profileEdit.discardChangesMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("profileEdit.discard"),
            style: "destructive",
            onPress: () => {
              form.resetForm();
              setPendingFamilyMembers([]);
            }
          }
        ]
      );
    }
  };

  const hasChanges = form.hasChanges || pendingFamilyMembers.length > 0;
  const changes = buildChanges();

  const renderContent = () => {
    if (!editedPerson) return null;

    switch (activeTab) {
      case "profile":
        return (
          <ProfileEditForm
            person={editedPerson}
            modifiedFields={modifiedFields}
            onFieldChange={handleFieldChange}
            onPhotoChange={handlePhotoChange}
          />
        );
      case "household":
        return (
          <HouseholdEdit
            householdId={editedPerson.householdId}
            currentPersonId={editedPerson.id}
            pendingFamilyMembers={pendingFamilyMembers}
            onFamilyMembersChange={setPendingFamilyMembers}
          />
        );
      case "account": return <AccountSettings />;
      case "visibility": return <VisibilitySettings />;
      default: return null;
    }
  };

  return (
    <SafeAreaProvider>
      <LoadingWrapper loading={isLoading}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <ProfileTabBar
            activeSection={activeTab}
            onTabChange={setActiveTab}
            hasChanges={hasChanges}
          />

          <View style={styles.content}>
            {renderContent()}
          </View>

          {/* Pending Changes Footer */}
          {hasChanges && activeTab !== "visibility" && (
            <PendingChangesView
              changes={changes}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          )}
        </View>
      </LoadingWrapper>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  content: { flex: 1 }
});

export default ProfileEdit;

import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, Card, IconButton } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { PersonInterface } from "../../interfaces";
import { Avatar } from "../common/Avatar";
import { LoadingWrapper } from "../wrapper/LoadingWrapper";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../theme";

interface HouseholdEditProps {
  householdId?: string;
  currentPersonId?: string;
  pendingFamilyMembers: string[];
  onFamilyMembersChange: (members: string[]) => void;
}

export const HouseholdEdit: React.FC<HouseholdEditProps> = ({
  householdId,
  currentPersonId,
  pendingFamilyMembers,
  onFamilyMembersChange
}) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [newMemberName, setNewMemberName] = useState("");
  const currentUserChurch = useCurrentUserChurch();

  const { data: householdMembers = [], isLoading } = useQuery<PersonInterface[]>({
    queryKey: [`/people/household/${householdId}`, "MembershipApi"],
    enabled: !!householdId && !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  });

  const handleAddMember = () => {
    const trimmedName = newMemberName.trim();
    if (trimmedName) {
      onFamilyMembersChange([...pendingFamilyMembers, trimmedName]);
      setNewMemberName("");
    }
  };

  const handleRemoveMember = (index: number) => {
    const newMembers = [...pendingFamilyMembers];
    newMembers.splice(index, 1);
    onFamilyMembersChange(newMembers);
  };

  const otherMembers = householdMembers.filter(m => m.id !== currentPersonId);

  return (
    <LoadingWrapper loading={isLoading}>
      <View style={styles.container}>
        {/* Current Household Members */}
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
              <MaterialIcons name="people" size={24} color={colors.primary} />
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
                {t("profileEdit.currentHousehold")}
              </Text>
            </View>

            {otherMembers.length === 0 ? (
              <Text variant="bodyMedium" style={[styles.emptyText, { color: colors.disabled }]}>
                {t("profileEdit.noOtherHouseholdMembers")}
              </Text>
            ) : (
              otherMembers.map((member) => (
                <View key={member.id} style={[styles.memberItem, { borderBottomColor: colors.border }]}>
                  <Avatar
                    size={48}
                    photoUrl={member.photo}
                    firstName={member.name?.first}
                    lastName={member.name?.last}
                  />
                  <View style={styles.memberInfo}>
                    <Text variant="titleSmall" style={[styles.memberName, { color: colors.text }]}>
                      {member.name?.display}
                    </Text>
                    {member.householdRole && (
                      <Text variant="bodySmall" style={[styles.memberRole, { color: colors.disabled }]}>
                        {member.householdRole}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Add Family Member */}
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
              <MaterialIcons name="person-add" size={24} color={colors.primary} />
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
                {t("profileEdit.addFamilyMember")}
              </Text>
            </View>

            <Text variant="bodySmall" style={[styles.helperText, { color: colors.disabled }]}>
              {t("profileEdit.addFamilyMemberDescription")}
            </Text>

            <View style={styles.addMemberRow}>
              <TextInput
                mode="outlined"
                label={t("profileEdit.firstName")}
                value={newMemberName}
                onChangeText={setNewMemberName}
                style={[styles.nameInput, { backgroundColor: colors.surface }]}
                outlineColor={colors.divider}
                activeOutlineColor={colors.primary}
              />
              <Button
                mode="contained"
                onPress={handleAddMember}
                disabled={!newMemberName.trim()}
                style={styles.addButton}
                buttonColor={colors.primary}
                textColor={colors.onPrimary}
                contentStyle={styles.addButtonContent}>
                {t("common.add")}
              </Button>
            </View>

            {/* Pending Family Members */}
            {pendingFamilyMembers.length > 0 && (
              <View style={[styles.pendingSection, { borderTopColor: colors.warningLight }]}>
                <Text variant="labelLarge" style={[styles.pendingLabel, { color: colors.text }]}>
                  {t("profileEdit.pendingFamilyMembers")}
                </Text>
                {pendingFamilyMembers.map((name, index) => (
                  <View key={index} style={[styles.pendingItem, { backgroundColor: colors.warningLight }]}>
                    <View style={styles.pendingIcon}>
                      <MaterialIcons name="person-outline" size={20} color={colors.warning} />
                    </View>
                    <Text variant="bodyMedium" style={[styles.pendingName, { color: colors.text }]}>
                      {name}
                    </Text>
                    <IconButton
                      icon="close"
                      size={20}
                      iconColor={colors.error}
                      onPress={() => handleRemoveMember(index)}
                      style={styles.removeButton}
                    />
                  </View>
                ))}
                <Text variant="bodySmall" style={[styles.pendingNote, { color: colors.disabled }]}>
                  {t("profileEdit.pendingMembersNote")}
                </Text>
              </View>
            )}
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
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingBottom: 8
  },
  sectionTitle: { fontWeight: "600" },
  emptyText: {
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1
  },
  memberName: { fontWeight: "600" },
  memberRole: {},
  helperText: { marginBottom: 16 },
  addMemberRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start"
  },
  nameInput: { flex: 1 },
  addButton: { marginTop: 6 },
  addButtonContent: { paddingHorizontal: 8 },
  pendingSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1
  },
  pendingLabel: {
    fontWeight: "600",
    marginBottom: 12
  },
  pendingItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8
  },
  pendingIcon: { marginRight: 8 },
  pendingName: { flex: 1 },
  removeButton: { margin: 0 },
  pendingNote: {
    fontStyle: "italic",
    marginTop: 8
  }
});

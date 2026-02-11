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
        <Card style={styles.section}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="people" size={24} color="#0D47A1" />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t("profileEdit.currentHousehold")}
              </Text>
            </View>

            {otherMembers.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyText}>
                {t("profileEdit.noOtherHouseholdMembers")}
              </Text>
            ) : (
              otherMembers.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <Avatar
                    size={48}
                    photoUrl={member.photo}
                    firstName={member.name?.first}
                    lastName={member.name?.last}
                  />
                  <View style={styles.memberInfo}>
                    <Text variant="titleSmall" style={styles.memberName}>
                      {member.name?.display}
                    </Text>
                    {member.householdRole && (
                      <Text variant="bodySmall" style={styles.memberRole}>
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
        <Card style={styles.section}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person-add" size={24} color="#0D47A1" />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t("profileEdit.addFamilyMember")}
              </Text>
            </View>

            <Text variant="bodySmall" style={styles.helperText}>
              {t("profileEdit.addFamilyMemberDescription")}
            </Text>

            <View style={styles.addMemberRow}>
              <TextInput
                mode="outlined"
                label={t("profileEdit.firstName")}
                value={newMemberName}
                onChangeText={setNewMemberName}
                style={styles.nameInput}
                outlineColor="#E0E0E0"
                activeOutlineColor="#0D47A1"
              />
              <Button
                mode="contained"
                onPress={handleAddMember}
                disabled={!newMemberName.trim()}
                style={styles.addButton}
                buttonColor="#0D47A1"
                textColor="#FFFFFF"
                contentStyle={styles.addButtonContent}>
                {t("common.add")}
              </Button>
            </View>

            {/* Pending Family Members */}
            {pendingFamilyMembers.length > 0 && (
              <View style={styles.pendingSection}>
                <Text variant="labelLarge" style={styles.pendingLabel}>
                  {t("profileEdit.pendingFamilyMembers")}
                </Text>
                {pendingFamilyMembers.map((name, index) => (
                  <View key={index} style={styles.pendingItem}>
                    <View style={styles.pendingIcon}>
                      <MaterialIcons name="person-outline" size={20} color="#FFC107" />
                    </View>
                    <Text variant="bodyMedium" style={styles.pendingName}>
                      {name}
                    </Text>
                    <IconButton
                      icon="close"
                      size={20}
                      iconColor="#E53935"
                      onPress={() => handleRemoveMember(index)}
                      style={styles.removeButton}
                    />
                  </View>
                ))}
                <Text variant="bodySmall" style={styles.pendingNote}>
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
  emptyText: {
    color: "#9E9E9E",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1
  },
  memberName: {
    color: "#3c3c3c",
    fontWeight: "600"
  },
  memberRole: { color: "#9E9E9E" },
  helperText: {
    color: "#9E9E9E",
    marginBottom: 16
  },
  addMemberRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start"
  },
  nameInput: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  addButton: { marginTop: 6 },
  addButtonContent: { paddingHorizontal: 8 },
  pendingSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#FFE082"
  },
  pendingLabel: {
    color: "#795548",
    fontWeight: "600",
    marginBottom: 12
  },
  pendingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8
  },
  pendingIcon: { marginRight: 8 },
  pendingName: {
    flex: 1,
    color: "#3c3c3c"
  },
  removeButton: { margin: 0 },
  pendingNote: {
    color: "#9E9E9E",
    fontStyle: "italic",
    marginTop: 8
  }
});

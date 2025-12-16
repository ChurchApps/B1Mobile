import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text, Card, Avatar, IconButton } from "react-native-paper";
import { router } from "expo-router";
import { Constants, EnvironmentHelper } from "../../helpers";
import { InlineLoader } from "../common/LoadingComponents";

interface GroupMember {
  id: string;
  person: {
    id: string;
    name: { display: string };
    photo?: string;
    householdId?: string;
    contactInfo?: any;
  };
}

interface GroupMembersTabProps {
  members: GroupMember[];
  isLoading: boolean;
}

export const GroupMembersTab: React.FC<GroupMembersTabProps> = ({
  members,
  isLoading
}) => {
  const handleMemberPress = (member: GroupMember) => {
    const memberData = {
      id: member?.person?.id,
      name: { display: member?.person?.name?.display },
      photo: member?.person?.photo,
      householdId: member?.person?.householdId,
      contactInfo: member?.person?.contactInfo
    };
    router.navigate({
      pathname: "/memberDetailRoot",
      params: { member: JSON.stringify(memberData) }
    });
  };

  if (isLoading) {
    return (
      <View style={styles.membersContainer}>
        <InlineLoader size="large" text="Loading members..." />
      </View>
    );
  }

  if (members.length === 0) {
    return (
      <View style={styles.membersContainer}>
        <View style={styles.emptyState}>
          <Avatar.Icon size={64} icon="account-group" style={styles.emptyIcon} />
          <Text variant="titleMedium" style={styles.emptyTitle}>
            No members found
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            Members will appear here when they join
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.membersContainer}>
      {members.map((item: GroupMember) => (
        <Card key={item?.id} style={styles.modernMemberCard}>
          <TouchableOpacity style={styles.memberCardContent} onPress={() => handleMemberPress(item)}>
            <Avatar.Image size={56} source={item?.person?.photo ? { uri: EnvironmentHelper.ContentRoot + item.person.photo } : Constants.Images.ic_member} />
            <View style={styles.memberInfo}>
              <Text variant="titleMedium" style={styles.memberName}>
                {item?.person?.name?.display}
              </Text>
              <Text variant="bodySmall" style={styles.memberRole}>
                Group Member
              </Text>
            </View>
            <IconButton icon="chevron-right" size={20} iconColor="#9E9E9E" />
          </TouchableOpacity>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  membersContainer: {
    minHeight: 200
  },
  modernMemberCard: {
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    backgroundColor: "#FFFFFF",
    marginBottom: 8
  },
  memberCardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16
  },
  memberName: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 2
  },
  memberRole: {
    color: "#9E9E9E"
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24
  },
  emptyIcon: {
    backgroundColor: "#F6F6F8",
    marginBottom: 16
  },
  emptyTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  }
});

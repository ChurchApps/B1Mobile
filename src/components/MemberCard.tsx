import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text } from "react-native-paper";
import { Avatar } from "./common/Avatar";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface Member {
  id: string;
  name: { display: string; first?: string; last?: string };
  photo?: string;
}

interface MemberCardProps {
  member: Member;
  onPress: (member: Member) => void;
  showActions?: boolean;
  onCall?: (member: Member) => void;
  onEmail?: (member: Member) => void;
  subtitle?: string;
  size?: "small" | "medium" | "large";
}

export const MemberCard = React.memo<MemberCardProps>(({ member, onPress, showActions = false, onCall, onEmail, subtitle, size = "medium" }) => {
  const handlePress = () => {
    onPress(member);
  };

  const avatarSize = size === "small" ? 40 : size === "large" ? 64 : 48;
  const cardStyle = size === "small" ? styles.smallCard : size === "large" ? styles.largeCard : styles.memberCard;

  // Format name with bold last name
  const formatName = (displayName: string) => {
    const nameParts = displayName.trim().split(" ");
    if (nameParts.length > 1) {
      const firstName = nameParts.slice(0, -1).join(" ");
      const lastName = nameParts[nameParts.length - 1];
      return { firstName, lastName };
    }
    return { firstName: displayName, lastName: "" };
  };

  const { firstName, lastName } = formatName(member.name.display);

  return (
    <Card style={cardStyle} onPress={handlePress}>
      <Card.Content style={styles.memberContent}>
        <View style={styles.memberInfo}>
          <Avatar size={avatarSize} photoUrl={member.photo} firstName={member.name.first || firstName} lastName={member.name.last || lastName} style={styles.memberAvatar} />
          <View style={styles.memberDetails}>
            <View style={styles.nameContainer}>
              <Text variant="titleMedium" style={styles.memberName} numberOfLines={1}>
                {firstName}
                {lastName ? " " : ""}
              </Text>
              {lastName && (
                <Text variant="titleMedium" style={styles.memberLastName} numberOfLines={1}>
                  {lastName}
                </Text>
              )}
            </View>
            {subtitle && (
              <Text variant="bodySmall" style={styles.memberSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Actions or Chevron */}
        <View style={styles.actions}>
          {showActions ? (
            <View style={styles.quickActions}>
              {onCall && (
                <TouchableOpacity style={styles.actionButton} onPress={() => onCall(member)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <MaterialIcons name="phone" size={20} color="#0D47A1" />
                </TouchableOpacity>
              )}
              {onEmail && (
                <TouchableOpacity style={styles.actionButton} onPress={() => onEmail(member)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <MaterialIcons name="email" size={20} color="#0D47A1" />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
                <MaterialIcons name="chevron-right" size={20} color="#9E9E9E" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
              <MaterialIcons name="chevron-right" size={20} color="#9E9E9E" />
            </TouchableOpacity>
          )}
        </View>
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  memberCard: {
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    backgroundColor: "#FFFFFF"
  },
  smallCard: {
    marginBottom: 6,
    borderRadius: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    backgroundColor: "#FFFFFF"
  },
  largeCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: "#FFFFFF"
  },
  memberContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  memberInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  memberAvatar: {
    marginRight: 16
  },
  memberDetails: {
    flex: 1
  },
  nameContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline"
  },
  memberName: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 2
  },
  memberLastName: {
    color: "#3c3c3c",
    fontWeight: "800",
    marginBottom: 2
  },
  memberSubtitle: {
    color: "#9E9E9E",
    fontSize: 12
  },
  actions: {
    justifyContent: "center",
    alignItems: "center"
  },
  quickActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F6F6F8",
    justifyContent: "center",
    alignItems: "center"
  }
});

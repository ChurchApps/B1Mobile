import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text } from "react-native-paper";
import { Avatar } from "./common/Avatar";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useThemeColors, CommonStyles } from "../theme";

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
  const tc = useThemeColors();
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
    <Card style={[cardStyle, { backgroundColor: tc.surface, shadowColor: tc.shadowBlack }]} onPress={handlePress}>
      <Card.Content style={[CommonStyles.rowBetween, { paddingVertical: 12, paddingHorizontal: 16 }]}>
        <View style={[CommonStyles.row, { flex: 1 }]}>
          <Avatar size={avatarSize} photoUrl={member.photo} firstName={member.name.first || firstName} lastName={member.name.last || lastName} style={styles.memberAvatar} />
          <View style={styles.memberDetails}>
            <View style={styles.nameContainer}>
              <Text variant="titleMedium" style={[styles.memberName, { color: tc.text }]} numberOfLines={1}>
                {firstName}
                {lastName ? " " : ""}
              </Text>
              {lastName && (
                <Text variant="titleMedium" style={[styles.memberLastName, { color: tc.text }]} numberOfLines={1}>
                  {lastName}
                </Text>
              )}
            </View>
            {subtitle && (
              <Text variant="bodySmall" style={[styles.memberSubtitle, { color: tc.textSecondary }]} numberOfLines={1}>
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
                <TouchableOpacity style={[CommonStyles.circularButton, { backgroundColor: tc.iconBackground }]} onPress={() => onCall(member)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <MaterialIcons name="phone" size={20} color={tc.primary} />
                </TouchableOpacity>
              )}
              {onEmail && (
                <TouchableOpacity style={[CommonStyles.circularButton, { backgroundColor: tc.iconBackground }]} onPress={() => onEmail(member)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <MaterialIcons name="email" size={20} color={tc.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[CommonStyles.circularButton, { backgroundColor: tc.iconBackground }]} onPress={handlePress}>
                <MaterialIcons name="chevron-right" size={20} color={tc.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[CommonStyles.circularButton, { backgroundColor: tc.iconBackground }]} onPress={handlePress}>
              <MaterialIcons name="chevron-right" size={20} color={tc.textSecondary} />
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  smallCard: {
    marginBottom: 6,
    borderRadius: 10,
    elevation: 1,
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  largeCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  memberAvatar: { marginRight: 16 },
  memberDetails: { flex: 1 },
  nameContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline"
  },
  memberName: {
    fontWeight: "600",
    marginBottom: 2
  },
  memberLastName: {
    fontWeight: "800",
    marginBottom: 2
  },
  memberSubtitle: { fontSize: 12 },
  actions: {
    justifyContent: "center",
    alignItems: "center"
  },
  quickActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  }
});

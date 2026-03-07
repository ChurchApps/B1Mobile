import { CheckinHelper } from "@/helpers/CheckinHelper";
import { PersonInterface, ServiceTimeInterface } from "@/helpers/Interfaces";
import { UserHelper } from "@/helpers/UserHelper";
import { ArrayHelper } from "@churchapps/helpers";
import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useAppTheme, useThemeColors } from "../../../src/theme";
import { Button, Divider, Card, Text } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";

interface Props {
  member: PersonInterface;
  time: ServiceTimeInterface;
  onDone: () => void;
  handleBack: () => void;
}

export const CheckinGroups = (props: Props) => {
  const { t } = useTranslation();
  const { theme, spacing } = useAppTheme();
  const colors = useThemeColors();
  const [selected, setSelected] = useState(null);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    setSelected(null);
    UserHelper.addOpenScreenEvent("GroupsScreen");
  }, []);

  const selectGroup = async (group_item: any) => {
    CheckinHelper.householdMembers;
    const member = ArrayHelper.getOne(CheckinHelper.householdMembers, "id", props.member.id);
    if (!member) return;
    const time = ArrayHelper.getOne(member.serviceTimes, "id", props.time.id);
    if (!time) return;
    time.selectedGroup = group_item;
    props.onDone();
  };

  const renderGroupItem = (item: any) => (
    <Card style={[styles.categoryCard, { backgroundColor: colors.card, shadowColor: colors.shadowBlack }]}>
      <TouchableOpacity onPress={() => setSelected(selected != item.key ? item.key : null)} activeOpacity={0.7} style={styles.categoryHeader}>
        <View style={styles.categoryHeaderContent}>
          <View style={[styles.categoryIconContainer, { backgroundColor: colors.iconBackground }]}>
            <MaterialIcons name="folder" size={24} color={colors.primary} />
          </View>
          <Text variant="titleMedium" style={[styles.categoryName, { color: colors.text }]}>
            {item.name || t("checkin.generalGroups")}
          </Text>
          <View style={styles.expandIcon}>
            <MaterialIcons name={selected === item.key ? "expand-less" : "expand-more"} size={24} color={colors.iconColor} />
          </View>
        </View>
      </TouchableOpacity>

      {selected === item.key && (
        <View style={[styles.groupsContainer, { backgroundColor: colors.background }]}>
          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
          {item.items.map((item_group: any) => (
            <TouchableOpacity key={`group-item-${item_group.id}`} onPress={() => selectGroup(item_group)} activeOpacity={0.7} style={[styles.groupItem, { borderBottomColor: colors.border }]}>
              <View style={styles.groupContent}>
                <View style={[styles.groupIconContainer, { backgroundColor: colors.card }]}>
                  <MaterialIcons name="group" size={20} color={colors.secondary} />
                </View>
                <Text variant="bodyLarge" style={[styles.groupName, { color: colors.text }]}>
                  {item_group.name}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.iconColor} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Section */}
      <View style={[styles.headerSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.iconHeaderContainer, { backgroundColor: colors.iconBackground }]}>
          <MaterialIcons name="groups" size={48} color={colors.primary} />
        </View>
        <Text variant="headlineLarge" style={[styles.headerTitle, { color: colors.text }]}>
          {t("checkin.selectGroup")}
        </Text>
        <Text variant="bodyLarge" style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          Choose a group for {props.member.name.display}
        </Text>
        <Text variant="bodyMedium" style={[styles.serviceTime, { color: colors.primary }]}>
          Service: {props.time.name}
        </Text>
      </View>

      {/* Groups List */}
      <View style={styles.contentSection}>
        {CheckinHelper.groupTree && CheckinHelper.groupTree.length > 0 ? (
          <FlatList data={CheckinHelper.groupTree} renderItem={({ item }) => renderGroupItem(item)} keyExtractor={(item: any) => item.key} style={styles.groupsList} contentContainerStyle={styles.groupsContent} showsVerticalScrollIndicator={false} />
        ) : (
          <Card style={[styles.emptyCard, { backgroundColor: colors.card, shadowColor: colors.shadowBlack }]}>
            <View style={styles.emptyContent}>
              <MaterialIcons name="group-off" size={64} color={colors.iconColor} />
              <Text variant="titleMedium" style={[styles.emptyTitle, { color: colors.text }]}>
                {t("checkin.noServicesAvailable")}
              </Text>
              <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                {t("checkin.noServicesMessage")}
              </Text>
            </View>
          </Card>
        )}
      </View>

      {/* Bottom Actions */}
      <View style={[styles.bottomSection, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Button mode="outlined" onPress={() => selectGroup(null)} style={[styles.skipButton, { borderColor: colors.disabled }]} labelStyle={[styles.skipButtonText, { color: colors.disabled }]} icon="close">
          {t("groups.noGroup")}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerSection: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 16
  },
  iconHeaderContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16
  },
  headerTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  headerSubtitle: {
    textAlign: "center",
    marginBottom: 8
  },
  serviceTime: {
    fontWeight: "600",
    textAlign: "center"
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 16
  },
  groupsList: { flex: 1 },
  groupsContent: { paddingBottom: 16 },
  categoryCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: "hidden"
  },
  categoryHeader: { borderRadius: 12 },
  categoryHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  categoryName: {
    flex: 1,
    fontWeight: "600"
  },
  expandIcon: {
    justifyContent: "center",
    alignItems: "center"
  },
  groupsContainer: {},
  divider: {
    height: 1
  },
  groupItem: {
    borderBottomWidth: 1
  },
  groupContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingLeft: 24
  },
  groupIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  groupName: {
    flex: 1,
    fontWeight: "500"
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1
  },
  skipButton: {
    borderRadius: 12,
    height: 48
  },
  skipButtonText: {
    fontWeight: "600"
  },
  emptyCard: {
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  emptyContent: {
    padding: 32,
    alignItems: "center"
  },
  emptyTitle: {
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    textAlign: "center",
    lineHeight: 20
  }
});

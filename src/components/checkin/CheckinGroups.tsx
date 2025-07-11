import { CheckinHelper, PersonInterface, ServiceTimeInterface, UserHelper } from "../../../src/helpers";
import { ArrayHelper } from "../../mobilehelper";
import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useAppTheme } from "../../../src/theme";
import { Button, Divider, Card, Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  member: PersonInterface;
  time: ServiceTimeInterface;
  onDone: () => void;
}

export const CheckinGroups = (props: Props) => {
  const { theme, spacing } = useAppTheme();
  const [selected, setSelected] = useState(null);
  const screenWidth = Dimensions.get('window').width;

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
    <Card style={styles.categoryCard}>
      <TouchableOpacity
        onPress={() => setSelected(selected != item.key ? item.key : null)}
        activeOpacity={0.7}
        style={styles.categoryHeader}
      >
        <View style={styles.categoryHeaderContent}>
          <View style={styles.categoryIconContainer}>
            <MaterialIcons name="folder" size={24} color="#0D47A1" />
          </View>
          <Text variant="titleMedium" style={styles.categoryName}>
            {item.name || "General Groups"}
          </Text>
          <View style={styles.expandIcon}>
            <MaterialIcons
              name={selected === item.key ? "expand-less" : "expand-more"}
              size={24}
              color="#9E9E9E"
            />
          </View>
        </View>
      </TouchableOpacity>
      
      {selected === item.key && (
        <View style={styles.groupsContainer}>
          <Divider style={styles.divider} />
          {item.items.map((item_group: any) => (
            <TouchableOpacity
              key={`group-item-${item_group.id}`}
              onPress={() => selectGroup(item_group)}
              activeOpacity={0.7}
              style={styles.groupItem}
            >
              <View style={styles.groupContent}>
                <View style={styles.groupIconContainer}>
                  <MaterialIcons name="group" size={20} color="#568BDA" />
                </View>
                <Text variant="bodyLarge" style={styles.groupName}>
                  {item_group.name}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color="#9E9E9E" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.iconHeaderContainer}>
          <MaterialIcons name="groups" size={48} color="#0D47A1" />
        </View>
        <Text variant="headlineLarge" style={styles.headerTitle}>
          Select Group
        </Text>
        <Text variant="bodyLarge" style={styles.headerSubtitle}>
          Choose a group for {props.member.name.display}
        </Text>
        <Text variant="bodyMedium" style={styles.serviceTime}>
          Service: {props.time.name}
        </Text>
      </View>

      {/* Groups List */}
      <View style={styles.contentSection}>
        {CheckinHelper.groupTree && CheckinHelper.groupTree.length > 0 ? (
          <FlatList
            data={CheckinHelper.groupTree}
            renderItem={({ item }) => renderGroupItem(item)}
            keyExtractor={(item: any) => item.key}
            style={styles.groupsList}
            contentContainerStyle={styles.groupsContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <MaterialIcons name="group-off" size={64} color="#9E9E9E" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No Groups Available
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                There are no groups configured for this service
              </Text>
            </View>
          </Card>
        )}
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomSection}>
        <Button
          mode="outlined"
          onPress={() => selectGroup(null)}
          style={styles.skipButton}
          labelStyle={styles.skipButtonText}
          icon="close"
        >
          No Group
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F8'
  },
  headerSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 16
  },
  iconHeaderContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F6F6F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  headerTitle: {
    color: '#3c3c3c',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8
  },
  headerSubtitle: {
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 8
  },
  serviceTime: {
    color: '#0D47A1',
    fontWeight: '600',
    textAlign: 'center'
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 16
  },
  groupsList: {
    flex: 1
  },
  groupsContent: {
    paddingBottom: 16
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: 'hidden'
  },
  categoryHeader: {
    borderRadius: 12
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F6F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  categoryName: {
    flex: 1,
    color: '#3c3c3c',
    fontWeight: '600'
  },
  expandIcon: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  groupsContainer: {
    backgroundColor: '#F6F6F8'
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0'
  },
  groupItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  groupContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 24
  },
  groupIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  groupName: {
    flex: 1,
    color: '#3c3c3c',
    fontWeight: '500'
  },
  bottomSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  skipButton: {
    borderColor: '#9E9E9E',
    borderRadius: 12,
    height: 48
  },
  skipButtonText: {
    color: '#9E9E9E',
    fontWeight: '600'
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  emptyContent: {
    padding: 32,
    alignItems: 'center'
  },
  emptyTitle: {
    color: '#3c3c3c',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center'
  },
  emptySubtitle: {
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 20
  }
});

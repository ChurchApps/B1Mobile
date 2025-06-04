import { CheckinHelper, PersonInterface, ServiceTimeInterface, UserHelper } from '@/src/helpers';
import { ArrayHelper } from '@churchapps/mobilehelper';
import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useAppTheme } from '@/src/theme';
import { Button, Card, Divider, List, Text } from 'react-native-paper';

interface Props {
  member: PersonInterface;
  time: ServiceTimeInterface;
  onDone: () => void
}

export const CheckinGroups = (props: Props) => {
  const { theme, spacing } = useAppTheme();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setSelected(null);
    UserHelper.addOpenScreenEvent('GroupsScreen');
  }, []);

  const selectGroup = async (group_item: any) => {
    CheckinHelper.householdMembers;
    const member = ArrayHelper.getOne(CheckinHelper.householdMembers, "id", props.member.id);
    if (!member) return;
    const time = ArrayHelper.getOne(member.serviceTimes, "id", props.time.id);
    if (!time) return;
    time.selectedGroup = group_item;
    props.onDone();
  }

  const renderGroupItem = (item: any) => (
    <View style={{ marginBottom: spacing.sm, backgroundColor: theme.colors.surfaceVariant, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.outlineVariant, overflow: 'hidden' }}>
      <List.Item
        title={item.name}
        left={props => <List.Icon {...props} icon={selected == item.key ? 'chevron-down' : 'chevron-right'} />}
        onPress={() => setSelected(selected != item.key ? item.key : null)}
        style={{ backgroundColor: 'transparent' }}
      />
      {selected == item.key && item.items.map((item_group: any) => (
        <View key={`group-item-${item_group.id}`} style={{ backgroundColor: theme.colors.background }}>
          <Divider />
          <List.Item
            title={item_group.name}
            onPress={() => selectGroup(item_group)}
            style={{ backgroundColor: theme.colors.surfaceVariant }}
          />
        </View>
      ))}
    </View>
  )

  return (
    <View>
      <Text variant="headlineMedium" style={{ marginBottom: spacing.md }}>Select a Group</Text>
      <FlatList
        data={CheckinHelper.groupTree}
        renderItem={({ item }) => renderGroupItem(item)}
        keyExtractor={(item: any) => item.key}
        style={{ width: "100%" }}
      />
      <Button
        mode="contained"
        onPress={() => selectGroup(null)}
        style={{ marginTop: spacing.md }}
      >
        NONE
      </Button>
    </View>
  );
};

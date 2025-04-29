import { ArrayHelper, DimensionHelper } from '@churchapps/mobilehelper';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import Icon from '@expo/vector-icons/FontAwesome';
import { CheckinHelper, PersonInterface, ServiceTimeInterface, UserHelper, globalStyles } from '@/src/helpers';
import { BottomButton } from '../BottomButton';

interface Props {
  member: PersonInterface;
  time: ServiceTimeInterface;
  onDone: () => void
}

export const CheckinGroups = (props: Props) => {
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
    <View>
      <TouchableOpacity style={[globalStyles.listMainView, { width: DimensionHelper.wp('90%') }]} onPress={() => { setSelected(selected != item.key ? item.key : null) }}>
        <Icon name={selected == item.key ? 'angle-down' : 'angle-right'} style={globalStyles.selectionIcon} size={DimensionHelper.wp('6%')} />
        <View style={globalStyles.listTextView}>
          <Text style={[globalStyles.groupListTitle, globalStyles.groupMainTitle]} numberOfLines={1}>{item.name}</Text>
        </View>
      </TouchableOpacity>
      {selected == item.key && item.items.map((item_group: any, index: any) => (
        <View style={{ ...globalStyles.groupView, borderBottomWidth: (index == item.items.length - 1) ? 0 : 1, width: DimensionHelper.wp('80%') }} key={item_group.id}>
          <TouchableOpacity style={globalStyles.groupBtn} onPress={() => selectGroup(item_group)}>
            <Text style={globalStyles.groupText}> {item_group.name} </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )

  return (
    <>
      <FlatList data={CheckinHelper.groupTree} renderItem={({ item }) => renderGroupItem(item)} keyExtractor={(item: any) => item.key} style={globalStyles.listContainerStyle} />
      <BottomButton title="NONE" onPress={() => selectGroup(null)} style={DimensionHelper.wp('100%')} />
    </>
  );
};

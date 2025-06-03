import { ApiHelper, CheckinHelper, Constants, EnvironmentHelper, PersonInterface, ServiceTimeInterface, globalStyles } from '@/src/helpers';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { ErrorHelper } from '@churchapps/mobilehelper';
import React, { useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BottomButton } from '../BottomButton';
import { Loader } from '../Loader';

interface Props {
  onDone: () => void
  showGroups: (member: PersonInterface, time: ServiceTimeInterface) => void
}

export const CheckinHousehold = (props: Props) => {
  const [selected, setSelected] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const submitAttendance = async () => {
    setLoading(true);

    let pendingVisits: any[] = [];
    CheckinHelper.householdMembers?.forEach((member: any) => {
      let visitSessionList: any[] = [];
      member.serviceTimes?.forEach((time: any) => {
        if (time.selectedGroup != null) {
          visitSessionList.push({ session: { serviceTimeId: time.id, groupId: time.selectedGroup.id, displayName: time.selectedGroup.name } })
        }
      })
      if (visitSessionList.length != 0) {
        pendingVisits.push({ personId: member.id, serviceId: CheckinHelper.serviceId, visitSessions: visitSessionList })
      }
    })

    ApiHelper.post("/visits/checkin?serviceId=" + CheckinHelper.serviceId + "&peopleIds=" + CheckinHelper.peopleIds, pendingVisits, "AttendanceApi");
    setLoading(false);
    try {
      CheckinHelper.householdMembers = [];
      CheckinHelper.groupTree = null;
      props.onDone();
    } catch (error: any) {
      console.log('CLEAR MEMBER LIST ERROR', error)
      ErrorHelper.logError("submit-attendance", error);
    }

  }

  const renderMemberItem = (item: any) => (
    <View>
      <TouchableOpacity style={[globalStyles.listMainView, { width: DimensionHelper.wp(90) }]} onPress={() => { setSelected(selected != item.id ? item.id : null) }}>
        <Icon name={selected == item.id ? 'angle-down' : 'angle-right'} style={globalStyles.selectionIcon} size={DimensionHelper.wp(6)} />
        <Image source={{ uri: EnvironmentHelper.ContentRoot + item.photo }} style={globalStyles.memberListIcon} />
        <View style={globalStyles.memberListTextView}>
          <Text style={[globalStyles.listTitleText, globalStyles.memberListTitle]} numberOfLines={1}>{item.name.display}</Text>
          {selected != item.id && item.serviceTimes.map((item_time: any) => (
            <View key={`service-time-${item_time.id}`}>
              {item_time.selectedGroup
                ? <Text style={globalStyles.selectedText} numberOfLines={1}>
                  {item_time.name}{" - "}{item_time.selectedGroup.name}
                </Text>
                : null}
            </View>
          ))}
        </View>
      </TouchableOpacity>
      {selected == item.id && item.serviceTimes && item.serviceTimes.map((item_time: any) => (
        <View style={{ ...globalStyles.classesView, borderBottomWidth: (item_time.id == item.serviceTimes[item.serviceTimes.length - 1]?.id) ? 0 : 1, width: DimensionHelper.wp(90) }} key={`service-time-${item_time.id}`}>
          <View style={globalStyles.classesTimeView}>
            <Icon name={'clock-o'} style={globalStyles.timeIcon} size={DimensionHelper.wp(5)} />
            <Text style={globalStyles.classesTimeText}>{item_time.name}</Text>
          </View>
          <TouchableOpacity style={{ ...globalStyles.classesNoneBtn, backgroundColor: item_time.selectedGroup ? Constants.Colors.button_green : Constants.Colors.button_bg }}
            onPress={() => item_time.selection ? null : props.showGroups(item, item_time)}>
            <Text style={globalStyles.classesNoneText} numberOfLines={3}>
              {item_time.selectedGroup ? item_time.selectedGroup.name : 'NONE'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )

  if (isLoading) return <Loader isLoading={isLoading} />
  else return (
    <>
      <FlatList data={CheckinHelper.householdMembers} renderItem={({ item }) => renderMemberItem(item)} keyExtractor={(item: any) => item.id} style={globalStyles.listContainerStyle} />
      <BottomButton title="CHECKIN" onPress={() => submitAttendance()} style={DimensionHelper.wp(100)} />
    </>
  );
};

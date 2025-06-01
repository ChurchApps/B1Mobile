import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import Icons from 'react-native-vector-icons/FontAwesome5';
import { ArrayHelper, AssignmentInterface, Constants, PlanInterface, PositionInterface, globalStyles } from "@/src/helpers";

interface Props {
  navigation: any,
  plans: PlanInterface[];
  positions: PositionInterface[];
  assignments: AssignmentInterface[];
}
export const ServingTimes = ({ plans, positions, assignments, navigation }: Props) => {

  const [servingTimes, setServingTimes] = useState([])

  const getStatusLabel = (status: string) => {
    let result = <Text style={[globalStyles.StatusFont, { color: Constants.Colors.Orange_color }]}>{status}</Text>
    if (status === "Accepted") result = (<Text style={[globalStyles.StatusFont, { color: Constants.Colors.Dark_Green }]}>{status}</Text>);
    else if (status === "Declined") result = (<Text style={[globalStyles.StatusFont, { color: Constants.Colors.button_red }]}>{status}</Text>);
    return result;
  }

  const getServingTimes = () => {
    const data: any = [];
    assignments.forEach((assignment) => {
      const position = positions.find(p => p.id === assignment.positionId);
      const plan = plans.find(p => p?.id === position?.planId);
      if (position && plan) data.push({ assignmentId: assignment?.id, planId: plan?.id, planName: plan?.name, serviceDate: plan.serviceDate, position: position?.name, status: assignment.status || "Unconfirmed" });
    });
    ArrayHelper.sortBy(data, "serviceDate", true);
    setServingTimes(data)

  }
  useEffect(() => {
    if (assignments || positions || plans) {
      getServingTimes();

    }
  }, [assignments, positions, plans])

  const renderItems = (item: any) => {
    const formattedDate = moment(item?.item?.serviceDate).format("MMM D, YYYY")
    return (
      <TouchableOpacity style={[globalStyles.classesView, { width: '95%' }]} onPress={() => navigation.navigate('PlanDetails', { id: item?.item?.planId })}>
        <View style={[globalStyles.PlanIconTitleView, { width: '100%' }]}>
          <Text style={[globalStyles.planTextStyle, globalStyles.TaskCreatorColor, { width: '25%' }]} >{item?.item?.planName}</Text>
          <Text style={[globalStyles.planTextStyle, { width: '20%' }]}>{formattedDate}</Text>
          <Text style={[globalStyles.planTextStyle, { width: '15%' }]}>{item?.item?.position}</Text>
          <Text style={[globalStyles.planTextStyle, { width: '25%' }]}>{getStatusLabel(item?.item?.status)}</Text>
        </View>
      </TouchableOpacity>
    )
  }
  return (
    <View style={globalStyles.FlatlistViewStyle} >
      <View style={{ marginLeft: DimensionHelper.wp(3), marginVertical: DimensionHelper.hp(2), flexDirection: 'row', alignItems: 'center', }}>
        <Icons name='calendar-alt' style={{ color: Constants.Colors.app_color }} size={DimensionHelper.wp(5.5)} />
        <Text style={globalStyles.PlanTitleTextStyle}>Serving Times</Text>
      </View>
      <View style={[globalStyles.classesView, { width: '95%', marginTop: 0, }]}>

        <Text style={[globalStyles.TableHeaderTitle, { width: '25%' }]}>Plan</Text>
        <Text style={[globalStyles.TableHeaderTitle, { width: '20%' }]}>Service Date</Text>
        <Text style={[globalStyles.TableHeaderTitle, { width: '15%' }]}>Role</Text>
        <Text style={[globalStyles.TableHeaderTitle, { width: '25%' }]}>Status</Text>

      </View>
      <FlatList
        data={servingTimes}
        scrollEnabled={false}
        keyExtractor={(item: any, index: number) => `key-${index}`}
        renderItem={item => renderItems(item)}
      />
    </View>
  )
}

import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ArrayHelper, AssignmentInterface, Constants, PlanInterface, PositionInterface, TimeInterface, globalStyles } from "@/src/helpers";

interface Props {
  plans: PlanInterface[];
  positions: PositionInterface[];
  assignments: AssignmentInterface[];
  times: TimeInterface[];
}
export const UpcomingDates = ({ plans, positions, assignments, times }: Props) => {

  const [UpcomingDates, setUpcomingDates] = useState([])

  const getUpcomingDatesData = () => {
    if (times?.length === 0) return [];
    const upcomingdata: any = [];
    assignments.forEach((assignment) => {
      const position = positions.find(p => p.id === assignment.positionId);
      const plan = plans.find(p => p.id === position?.planId);
      const timesData = ArrayHelper.getAll(times, "planId", plan?.id);
      timesData.forEach((t: any) => {
        const endTimeMoment = moment(t.endTime);
        const now = moment();
        if (endTimeMoment.isAfter(now)) {
          if (t.teams?.indexOf(position?.categoryName) > -1) {
            upcomingdata.push({ timeId: t.id, timeName: t.displayName, startTime: t.startTime, status: "Unconfirmed" });
          }
        }
      });

    });
    ArrayHelper.sortBy(upcomingdata, "startTime", false)
    setUpcomingDates(upcomingdata)
  }

  useEffect(() => {
    if (assignments || positions || plans || times) {
      getUpcomingDatesData();
    }
  }, [assignments, positions, plans, times])

  const renderUpcomingDates = (item: any) => {
    const formattedDate = moment(item?.item?.startTime).format("MMM D, YYYY")
    return (
      <View style={[globalStyles.classesView, { width: '95%', paddingVertical: DimensionHelper.hp(1) }]}>
        <Text style={[globalStyles.planTextStyle, { width: '50%' }]}>{item?.item?.timeName}</Text>
        <Text style={[globalStyles.planTextStyle, { width: '45%' }]}>{formattedDate}</Text>
      </View>
    )
  }

  return (
    <View style={globalStyles.FlatlistViewStyle} >
      <View style={{ marginLeft: DimensionHelper.wp(3), marginVertical: DimensionHelper.hp(2), flexDirection: 'row', alignItems: 'center', }}>
        <Icons name='calendar' style={{ color: Constants.Colors.app_color }} size={DimensionHelper.wp(5.5)} />
        <Text style={[globalStyles.LatestUpdateTextStyle, { paddingLeft: DimensionHelper.wp(3), color: Constants.Colors.app_color }]}>Upcoming Dates</Text>
      </View>
      <View style={[globalStyles.classesView, { width: '95%' }]}>
        <Text style={[globalStyles.TableHeaderTitle, { width: '50%' }]}>Event</Text>
        <Text style={[globalStyles.TableHeaderTitle, { width: '45%' }]}>Start Time</Text>
      </View>
      <FlatList
        data={UpcomingDates}
        scrollEnabled={false}
        keyExtractor={(item: any, index: number) => `key-${index}`}
        renderItem={item => renderUpcomingDates(item)}
      />
    </View>
  )
}

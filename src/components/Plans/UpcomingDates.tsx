import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import Icons from 'react-native-vector-icons/FontAwesome5';
import { ArrayHelper, AssignmentInterface, Constants, PlanInterface, PositionInterface, TimeInterface, globalStyles } from "@/src/helpers";

interface Props {
  navigation: any,
  plans: PlanInterface[];
  positions: PositionInterface[];
  assignments: AssignmentInterface[];
  times: TimeInterface[];
}

export const UpcomingDates = ({ plans, positions, assignments, times, navigation }: Props) => {
  const [upcomingDates, setUpcomingDates] = useState<any[]>([]);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getUpcomingDates = () => {
    const data: any = [];
    assignments.forEach((assignment) => {
      const position = positions.find(p => p.id === assignment.positionId);
      const plan = plans.find(p => p?.id === position?.planId);
      const time = times.find(t => t.planId === plan?.id);

      if (position && plan && time) {
        data.push({
          assignmentId: assignment?.id,
          planId: plan?.id,
          planName: plan?.name,
          serviceDate: plan.serviceDate,
          position: position?.name,
          time: time?.displayName,
          status: assignment.status || "Unconfirmed"
        });
      }
    });
    ArrayHelper.sortBy(data, "serviceDate", true);
    setUpcomingDates(data);
  };

  useEffect(() => {
    if (assignments && positions && plans && times) {
      getUpcomingDates();
    }
  }, [assignments, positions, plans, times]);

  const getStatusBadge = (status: string) => {
    let backgroundColor = Constants.Colors.Orange_color;
    if (status === "Accepted") backgroundColor = Constants.Colors.Dark_Green;
    else if (status === "Declined") backgroundColor = Constants.Colors.button_red;

    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };

  const renderItems = (item: any) => {
    const formattedDate = moment(item?.item?.serviceDate).format("MMM D, YYYY");
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('PlanDetails', { id: item?.item?.planId })}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.planInfo}>
              <Text style={styles.planNameVisible} numberOfLines={1}>{item?.item?.planName}</Text>
              <View style={styles.dateTimeContainer}>
                <Icons name="calendar-day" size={14} color="#666" style={styles.icon} />
                <Text style={styles.dateTextVisible}>{formattedDate}</Text>
                <Icons name="clock" size={14} color="#666" style={[styles.icon, styles.timeIcon]} />
                <Text style={styles.timeTextVisible}>{item?.item?.time}</Text>
              </View>
            </View>
            <View style={styles.roleInfo}>
              <Icons name="user-tie" size={14} color={Constants.Colors.app_color} style={styles.roleIcon} />
              <Text style={styles.roleTextVisible}>{item?.item?.position}</Text>
            </View>
            {getStatusBadge(item?.item?.status)}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icons name='calendar-week' style={styles.headerIcon} size={DimensionHelper.wp(5.5)} />
        <Text style={styles.headerTitle}>Upcoming Dates</Text>
      </View>

      {upcomingDates.length === 0 ? (
        <View style={styles.emptyState}>
          <Icons name="calendar-times" size={DimensionHelper.wp(8)} color="#ccc" />
          <Text style={styles.emptyStateText}>No upcoming dates found</Text>
        </View>
      ) : (
        <View>
          {upcomingDates.map((item, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.planInfo}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222' }} numberOfLines={1}>{item.planName}</Text>
                  <View style={styles.dateTimeContainer}>
                    <Icons name="calendar-day" size={14} color="#666" style={styles.icon} />
                    <Text style={{ fontSize: 16, color: '#222' }}>{item.serviceDate}</Text>
                    <Icons name="clock" size={14} color="#666" style={[styles.icon, styles.timeIcon]} />
                    <Text style={{ fontSize: 16, color: '#222' }}>{item.time}</Text>
                  </View>
                </View>
                <View style={styles.roleInfo}>
                  <Icons name="user-tie" size={14} color={Constants.Colors.app_color} style={styles.roleIcon} />
                  <Text style={{ fontSize: 16, color: '#222' }}>{item.position}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#1976d2' }]}> {/* Use blue for now */}
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>{item.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DimensionHelper.hp(3),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DimensionHelper.hp(2),
  },
  headerIcon: {
    color: Constants.Colors.app_color,
    marginRight: DimensionHelper.wp(2),
  },
  headerTitle: {
    fontSize: DimensionHelper.wp(4.5),
    fontWeight: '600',
    color: '#333',
  },
  listContent: {
    gap: DimensionHelper.hp(1.5),
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: DimensionHelper.wp(4),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planInfo: {
    flex: 1,
    marginRight: DimensionHelper.wp(2),
  },
  planNameVisible: {
    fontSize: DimensionHelper.wp(3.8),
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  timeIcon: {
    marginLeft: DimensionHelper.wp(3),
  },
  dateTextVisible: {
    fontSize: DimensionHelper.wp(3.2),
    color: '#333',
  },
  timeTextVisible: {
    fontSize: DimensionHelper.wp(3.2),
    color: '#333',
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: DimensionHelper.wp(3),
  },
  roleIcon: {
    marginRight: 6,
  },
  roleTextVisible: {
    fontSize: DimensionHelper.wp(3.2),
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: DimensionHelper.wp(3),
    paddingVertical: DimensionHelper.hp(0.5),
    borderRadius: 12,
    minWidth: DimensionHelper.wp(20),
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: DimensionHelper.wp(3),
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: DimensionHelper.wp(6),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: DimensionHelper.hp(2),
  },
  emptyStateText: {
    fontSize: DimensionHelper.wp(3.5),
    color: '#666',
    marginTop: DimensionHelper.hp(2),
    marginBottom: DimensionHelper.hp(1),
  },
});

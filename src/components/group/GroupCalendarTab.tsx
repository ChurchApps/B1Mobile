import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { Calendar, DateData } from "react-native-calendars";
import { router } from "expo-router";
import { useAppTheme } from "../../theme";
import { InlineLoader } from "../common/LoadingComponents";

interface GroupCalendarTabProps {
  groupId: string;
  isLeader: boolean;
  isLoading: boolean;
  selected: string;
  markedDates: any;
  onDayPress: (day: DateData) => void;
  onMonthChange?: (month: DateData) => void;
}

export const GroupCalendarTab: React.FC<GroupCalendarTabProps> = ({
  groupId,
  isLeader,
  isLoading,
  selected,
  markedDates,
  onDayPress,
  onMonthChange
}) => {
  const { theme } = useAppTheme();

  const handleAddEvent = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startTime = new Date(tomorrow);
    startTime.setHours(14, 0, 0, 0); // 2:00 PM
    
    const endTime = new Date(tomorrow);
    endTime.setHours(15, 0, 0, 0); // 3:00 PM
    
    const newEvent = { 
      start: startTime, 
      end: endTime,
      allDay: false, 
      groupId: groupId, 
      visibility: "public",
      title: "",
      description: "",
      recurrenceRule: ""
    };
    
    router.navigate({
      pathname: "/(drawer)/createEvent",
      params: { 
        event: JSON.stringify(newEvent),
        groupId: groupId
      }
    });
  };

  return (
    <View style={styles.calendarContainer}>
      {isLeader && (
        <Button
          mode="contained"
          icon="calendar-plus"
          onPress={handleAddEvent}
          style={styles.addEventButton}
        >
          Add Event
        </Button>
      )}
      <Calendar
        current={selected}
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        theme={{
          backgroundColor: theme.colors.surface,
          calendarBackground: theme.colors.surface,
          textSectionTitleColor: theme.colors.primary,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: theme.colors.onPrimary,
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.onSurface,
          textDisabledColor: theme.colors.onSurfaceDisabled,
          arrowColor: theme.colors.primary,
          monthTextColor: theme.colors.onSurface,
          indicatorColor: theme.colors.primary,
          textDayFontWeight: "500",
          textMonthFontWeight: "600",
          textDayHeaderFontWeight: "600"
        }}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <InlineLoader size="small" text="Loading events..." />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    minHeight: 350
  },
  addEventButton: {
    marginBottom: 16,
    backgroundColor: "#70DC87"
  },
  loadingOverlay: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center'
  }
});
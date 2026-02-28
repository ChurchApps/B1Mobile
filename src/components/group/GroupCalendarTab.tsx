import React from "react";
import { ScrollView, View, StyleSheet, Alert, Linking } from "react-native";
import { Button, Chip } from "react-native-paper";
import { Calendar, DateData } from "react-native-calendars";
import { router } from "expo-router";
import { useAppTheme } from "../../theme";
import { InlineLoader } from "../common/LoadingComponents";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import { EnvironmentHelper } from "../../helpers";

interface GroupCalendarTabProps {
  groupId: string;
  isLeader: boolean;
  isLoading: boolean;
  selected: string;
  markedDates: any;
  onDayPress: (day: DateData) => void;
  onMonthChange?: (month: DateData) => void;
  tags?: string[];
  selectedTags?: string[];
  onToggleTag?: (tag: string) => void;
  onClearTags?: () => void;
}

export const GroupCalendarTab: React.FC<GroupCalendarTabProps> = ({ groupId, isLeader, isLoading, selected, markedDates, onDayPress, onMonthChange, tags, selectedTags, onToggleTag, onClearTags }) => {
  const { theme } = useAppTheme();
  const currentUserChurch = useCurrentUserChurch();

  const handleSubscribe = async () => {
    const churchId = currentUserChurch?.church?.id;
    if (!churchId) {
      Alert.alert("Error", "Unable to get church information. Please try again.");
      return;
    }

    // Replace https:// with webcal:// to open in calendar app
    const baseUrl = EnvironmentHelper.ContentApi.replace("https://", "webcal://");
    const subscriptionUrl = `${baseUrl}/events/subscribe?groupId=${groupId}&churchId=${churchId}`;

    try {
      const supported = await Linking.canOpenURL(subscriptionUrl);
      if (supported) {
        await Linking.openURL(subscriptionUrl);
      } else {
        Alert.alert("Error", "Unable to open calendar app. Please try again.");
      }
    } catch (error) {
      console.error("Failed to open calendar:", error);
      Alert.alert("Error", "Failed to open calendar app. Please try again.");
    }
  };

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
      pathname: "/createEventRoot",
      params: {
        event: JSON.stringify(newEvent),
        groupId: groupId
      }
    });
  };

  return (
    <View style={styles.calendarContainer}>
      {isLeader && (
        <Button mode="contained" icon="calendar-plus" onPress={handleAddEvent} style={styles.addEventButton}>
          Add Event
        </Button>
      )}
      <Button mode="outlined" icon="calendar-sync" onPress={handleSubscribe} style={styles.subscribeButton}>
        Subscribe
      </Button>
      {tags && tags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagContainer} contentContainerStyle={styles.tagContent}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              selected={selectedTags?.includes(tag)}
              onPress={() => onToggleTag?.(tag)}
              style={styles.tagChip}
              compact
            >
              {tag}
            </Chip>
          ))}
          {selectedTags && selectedTags.length > 0 && (
            <Chip onPress={onClearTags} onClose={onClearTags} style={styles.tagChip} compact>Clear</Chip>
          )}
        </ScrollView>
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
  calendarContainer: { minHeight: 350 },
  addEventButton: {
    marginBottom: 16,
    backgroundColor: "#70DC87"
  },
  subscribeButton: { marginBottom: 16 },
  loadingOverlay: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    alignItems: "center"
  },
  tagContainer: { marginBottom: 8, maxHeight: 40 },
  tagContent: { gap: 6, paddingHorizontal: 2 },
  tagChip: { height: 32 }
});

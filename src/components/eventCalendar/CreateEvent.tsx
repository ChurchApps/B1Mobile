import { EventHelper, ApiHelper, EventExceptionInterface, EventInterface } from "@churchapps/helpers";
import dayjs from "../../helpers/dayjsConfig";
import React, { useState, useRef } from "react";
import { Alert, StyleSheet, View, ScrollView, SafeAreaView } from "react-native";
import DatePicker from "react-native-date-picker";
import { Text, TextInput, Button, Switch, Appbar } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import EditRecurringModal from "./EditRecurringModal";
import RRuleEditor from "./RRuleEditor";
import { useScreenHeader } from "@/hooks/useNavigationHeader";
import { useTranslation } from "react-i18next";

interface Props {
  event: EventInterface;
  onDone?: () => void;
}

export default function CreateEvent(props: Props) {
  const { t } = useTranslation();

  const getInitialEvent = () => {
    const baseEvent = { ...props.event };

    // Set default dates if not provided
    if (!baseEvent.start) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0); // 2:00 PM
      baseEvent.start = tomorrow.toISOString();
    }

    if (!baseEvent.end) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(15, 0, 0, 0); // 3:00 PM
      baseEvent.end = tomorrow.toISOString();
    }

    return baseEvent;
  };

  const [event, setEvent] = useState(getInitialEvent());
  const [rRule, setRRule] = useState(event.recurrenceRule);
  const [recurrenceModalType, setRecurrenceModalType] = useState("save");

  const [isPrivate, setIsPrivate] = useState(event.visibility === "private");
  const [title, setTitle] = useState(event.title || "");
  const [description, setDescription] = useState(event.description || "");

  const [allDay, setAllDay] = useState(event.allDay ?? false);
  const [recurring, setRecurring] = useState((event.recurrenceRule?.length ?? 0) > 0);

  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);

  useScreenHeader({
    title: event?.id ? t("events.editEvent") : t("events.createEvent"),
    headerRight: event?.id
      ? () => (
        <View>
          <Appbar.Action icon="delete" onPress={handleDelete} color="white" />
        </View>
      )
      : undefined,
    dependencies: [event?.id, event?.recurrenceRule] // dynamic dependencies
  });

  const getDefaultStartDate = () => {
    if (event.start) {
      const date = new Date(event.start);
      console.log("getDefaultStartDate conversion:", {
        utcString: event.start,
        localDate: date.toString(),
        localISO: date.toISOString()
      });
      return date;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2:00 PM
    return tomorrow;
  };

  const getDefaultEndDate = () => {
    if (event.end) {
      const date = new Date(event.end);
      console.log("getDefaultEndDate conversion:", {
        utcString: event.end,
        localDate: date.toString(),
        localISO: date.toISOString()
      });
      return date;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0); // 3:00 PM
    return tomorrow;
  };

  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());

  const [showEventEditModal, setShowEventEditModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleSave = () => {
    if (props.event.recurrenceRule) setRecurrenceModalType("save");
    else {
      const ev = { ...event };

      if (!ev.title || ev.title === "") {
        Alert.alert(t("events.enterTitle"));
        return;
      }

      ev.recurrenceRule = rRule;

      console.log("handleSave - sending event to API:", {
        id: ev.id,
        title: ev.title,
        start: ev.start,
        end: ev.end,
        startType: typeof ev.start,
        endType: typeof ev.end
      });

      setLoading(true);
      ApiHelper.post("/events", [ev], "ContentApi")
        .then(() => {
          setLoading(false);
          console.log("Event saved successfully");
          if (props.onDone) props.onDone();
        })
        .catch(error => {
          setLoading(false);
          Alert.alert(t("donations.error"), t("events.failedToCreateEvent"));
          console.error("Error creating event:", error);
        });
    }
  };

  const handleRecurringSave = async (editType: string) => {
    try {
      switch (editType) {
        case "this":
          {
            const exception: EventExceptionInterface = { eventId: event.id, exceptionDate: event.start };
            await ApiHelper.post("/eventExceptions", [exception], "ContentApi");
            const oneEv = { ...event };
            oneEv.id = undefined;
            oneEv.recurrenceRule = undefined;
            await ApiHelper.post("/events", [oneEv], "ContentApi");
            if (props.onDone) props.onDone();
            setShowEventEditModal(false);
          }
          break;
        case "future":
          {
            const newEvent = { ...event };
            newEvent.id = undefined;
            newEvent.recurrenceRule = rRule;

            const originalEv = await ApiHelper.get("/events/" + props.event.id, "ContentApi");
            const rrule = EventHelper.getFullRRule(originalEv);
            rrule.options.until = newEvent.start ? new Date(newEvent.start) : new Date();
            EventHelper.cleanRule(rrule.options);
            originalEv.recurrenceRule = EventHelper.getPartialRRuleString(rrule.options);
            await ApiHelper.post("/events", [originalEv, newEvent], "ContentApi");
            if (props.onDone) props.onDone();
            setShowEventEditModal(false);
          }
          break;
        case "all":
          {
            const allEv = { ...event };
            allEv.recurrenceRule = rRule;
            await ApiHelper.post("/events", [allEv], "ContentApi");
            if (props.onDone) props.onDone();
            setShowEventEditModal(false);
          }
          break;
      }
    } catch (error) {
      console.error("Error saving recurring event:", error);
      Alert.alert(t("donations.error"), t("events.failedToSaveEvent"));
    }
  };

  const handleRecurringDelete = async (editType: string) => {
    try {
      switch (editType) {
        case "this": {
          const exception: EventExceptionInterface = { eventId: event.id, exceptionDate: event.start };
          await ApiHelper.post("/eventExceptions", [exception], "ContentApi");
          if (props.onDone) props.onDone();
          setShowEventEditModal(false);
          break;
        }
        case "future": {
          const ev = { ...event };
          const rrule = EventHelper.getFullRRule(ev);
          rrule.options.until = ev.start ? new Date(ev.start) : new Date();
          ev.start = props.event.start; //Keep the original start date, not this instance's start date
          event.recurrenceRule = EventHelper.getPartialRRuleString(rrule.options);
          await ApiHelper.post("/events", [event], "ContentApi");
          if (props.onDone) props.onDone();
          setShowEventEditModal(false);
          break;
        }
        case "all": {
          await ApiHelper.delete("/events/" + event.id, "ContentApi");
          if (props.onDone) props.onDone();
          setShowEventEditModal(false);
          break;
        }
      }
    } catch (error) {
      console.error("Error deleting recurring event:", error);
      Alert.alert(t("donations.error"), t("events.failedToDeleteEvent"));
    }
  };

  const handleToggleRecurring = (checked: boolean) => {
    setRecurring(checked);
    const recurrenceRule = checked ? "FREQ=DAILY;INTERVAL=1" : "";
    // setEvent({ ...event, recurrenceRule });
    setEvent(prevEvent => {
      const updatedEvent = { ...prevEvent, recurrenceRule };
      setRRule(updatedEvent.recurrenceRule);
      return updatedEvent;
    });

    // Scroll to recurrence rules when enabled
    if (checked) {
      setTimeout(() => {
        // Simple approach: scroll to end since recurrence rules are at the bottom
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200); // Slightly longer delay to ensure the component has rendered
    }
  };

  const handleChange = (type: string, e: Date) => {
    const env = { ...event };
    console.log(`handleChange ${type}:`, {
      selectedDate: e.toString(),
      selectedUTC: e.toISOString()
    });

    switch (type) {
      case "start":
        // Store as ISO string for API compatibility (UTC)
        env.start = e.toISOString();
        setStartDate(e);
        break;
      case "end":
        // Store as ISO string for API compatibility (UTC)
        env.end = e.toISOString();
        setEndDate(e);
        break;
    }
    setEvent(env);
  };

  const handleDelete = async () => {
    if (props.event.recurrenceRule) {
      console.log("Event not deleted");
      setRecurrenceModalType("delete");
      setShowEventEditModal(true);
    } else {
      ApiHelper.delete("/events/" + event.id, "ContentApi")
        .then(() => {
          console.log("Event deleted successfully");
          if (props.onDone) props.onDone();
        })
        .catch(error => {
          console.error("Error deleting event:", error);
          Alert.alert(t("donations.error"), t("events.failedToDeleteEvent"));
        });
    }
  };

  const handleEditEvent = () => {
    if (event?.id && !event?.recurrenceRule) {
      handleSave();
      setRecurrenceModalType("save");
    } else if (event?.id && event?.recurrenceRule) {
      setShowEventEditModal(true);
      setRecurrenceModalType("save");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Content */}
      <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.fieldContainer}>
          <Text variant="titleMedium" style={styles.fieldLabel}>
            {t("events.eventTitle")}
          </Text>
          <TextInput
            mode="outlined"
            placeholder={t("events.enterEventTitle")}
            value={title}
            onChangeText={text => {
              setTitle(text);
              setEvent(prev => ({ ...prev, title: text }));
            }}
            style={styles.textInput}
            error={!title.trim()}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldContainer}>
          <Text variant="titleMedium" style={styles.fieldLabel}>
            {t("events.description")}
          </Text>
          <TextInput
            mode="outlined"
            placeholder={t("events.enterEventDescription")}
            value={description}
            onChangeText={text => {
              setDescription(text);
              setEvent(prev => ({ ...prev, description: text }));
            }}
            multiline
            numberOfLines={3}
            style={styles.textInput}
          />
        </View>

        {/* Date and Time */}
        <View style={styles.fieldContainer}>
          <Text variant="titleMedium" style={styles.fieldLabel}>
            {allDay ? t("events.date") : t("events.dateTime")}
          </Text>

          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeRow}>
              <Text variant="bodyMedium" style={styles.dateTimeLabel}>
                {t("events.start")}
              </Text>
              <Button mode="outlined" onPress={() => setOpenStartPicker(true)} style={styles.dateTimeButton} contentStyle={styles.dateTimeButtonContent}>
                <MaterialIcons name="event" size={16} color="#0D47A1" />
                <Text style={styles.dateTimeText}>{allDay ? dayjs(startDate).format("ll") : dayjs(startDate).format("lll")}</Text>
              </Button>
            </View>

            <View style={styles.dateTimeRow}>
              <Text variant="bodyMedium" style={styles.dateTimeLabel}>
                {t("events.end")}
              </Text>
              <Button mode="outlined" onPress={() => setOpenEndPicker(true)} style={styles.dateTimeButton} contentStyle={styles.dateTimeButtonContent}>
                <MaterialIcons name="event" size={16} color="#0D47A1" />
                <Text style={styles.dateTimeText}>{allDay ? dayjs(endDate).format("ll") : dayjs(endDate).format("lll")}</Text>
              </Button>
            </View>
          </View>
        </View>

        {/* Options */}
        <View style={styles.fieldContainer}>
          <Text variant="titleMedium" style={styles.fieldLabel}>
            {t("events.options")}
          </Text>
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text variant="bodyLarge" style={styles.optionTitle}>
                {t("events.allDayEvent")}
              </Text>
              <Text variant="bodySmall" style={styles.optionSubtitle}>
                {t("events.eventLastsEntireDay")}
              </Text>
            </View>
            <Switch
              value={allDay}
              onValueChange={value => {
                setAllDay(value);
                setEvent({ ...event, allDay: value });
              }}
              color="#0D47A1"
            />
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text variant="bodyLarge" style={styles.optionTitle}>
                {t("events.excludeFromCuratedCalendars")}
              </Text>
              <Text variant="bodySmall" style={styles.optionSubtitle}>
                {t("events.hideFromPublicListings")}
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={value => {
                setIsPrivate(value);
                setEvent(prev => ({
                  ...prev,
                  visibility: value ? "private" : "public"
                }));
              }}
              color="#0D47A1"
            />
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text variant="bodyLarge" style={styles.optionTitle}>
                {t("events.recurringEvent")}
              </Text>
              <Text variant="bodySmall" style={styles.optionSubtitle}>
                {t("events.eventRepeatsOnSchedule")}
              </Text>
            </View>
            <Switch value={recurring} onValueChange={handleToggleRecurring} color="#0D47A1" />
          </View>
        </View>

        {/* Recurrence Rule Editor */}
        {recurring && (
          <View style={styles.fieldContainer}>
            <Text variant="titleMedium" style={styles.fieldLabel}>
              {t("events.recurrencePattern")}
            </Text>
            <RRuleEditor
              start={startDate}
              rRule={rRule || ""}
              onChange={(rRule: string) => {
                setRRule(rRule);
              }}
            />
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Actions - Hide when recurring edit modal is open */}
      {!showEventEditModal && (
        <View style={styles.bottomActions}>
          <Button mode="outlined" onPress={() => props.onDone?.()} style={styles.actionButton}>
            {t("common.cancel")}
          </Button>
          <Button mode="contained" onPress={event?.id ? handleEditEvent : handleSave} loading={loading} disabled={!title.trim() || loading} style={styles.actionButton}>
            {event?.id ? t("events.saveChanges") : t("events.createEvent")}
          </Button>
        </View>
      )}

      {/* Date Pickers */}
      <DatePicker
        modal
        open={openStartPicker}
        date={startDate}
        mode={allDay ? "date" : "datetime"}
        onConfirm={date => {
          setOpenStartPicker(false);
          setStartDate(date);
          handleChange("start", date);
        }}
        onCancel={() => setOpenStartPicker(false)}
      />

      <DatePicker
        modal
        open={openEndPicker}
        date={endDate}
        mode={allDay ? "date" : "datetime"}
        onConfirm={date => {
          setOpenEndPicker(false);
          setEndDate(date);
          handleChange("end", date);
        }}
        onCancel={() => setOpenEndPicker(false)}
      />

      {/* Recurring Event Edit Modal */}
      {showEventEditModal && recurrenceModalType && (
        <EditRecurringModal
          action={recurrenceModalType}
          setModal={setShowEventEditModal}
          onDone={editType => {
            recurrenceModalType === "delete" ? handleRecurringDelete(editType) : handleRecurringSave(editType);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  header: {
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 100
  },
  fieldContainer: { marginVertical: 16 },
  fieldLabel: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 8
  },
  textInput: { backgroundColor: "#FFFFFF" },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  optionInfo: { flex: 1 },
  optionTitle: {
    color: "#3c3c3c",
    fontWeight: "500",
    marginBottom: 2
  },
  optionSubtitle: { color: "#9E9E9E" },
  dateTimeContainer: { marginTop: 8 },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  dateTimeLabel: {
    color: "#3c3c3c",
    fontWeight: "500",
    minWidth: 50
  },
  dateTimeButton: {
    flex: 1,
    marginLeft: 16
  },
  dateTimeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 8
  },
  dateTimeText: {
    color: "#3c3c3c",
    marginLeft: 8,
    fontSize: 14
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 12
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8
  }
});

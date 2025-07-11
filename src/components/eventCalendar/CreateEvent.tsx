import { EventHelper } from "@churchapps/helpers/src/EventHelper";
import { ApiHelper, DateHelper, EventExceptionInterface, EventInterface } from "../../mobilehelper";
import dayjs from "dayjs";
import React, { useState } from "react";
import { Alert, StyleSheet, View, ScrollView } from "react-native";
import DatePicker from "react-native-date-picker";
import { 
  Modal, 
  Portal, 
  Card, 
  Text, 
  TextInput, 
  Button, 
  Switch, 
  IconButton, 
  Divider,
  ActivityIndicator,
  Provider as PaperProvider,
  MD3LightTheme
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import CheckBox from "../CheckBox";
import EditRecurringModal from "./EditRecurringModal";
import RRuleEditor from "./RRuleEditor";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#0D47A1",
    secondary: "#F6F6F8",
    surface: "#FFFFFF",
    background: "#F6F6F8"
  }
};

interface Props {
  event: EventInterface;
  onDone?: () => void;
}

export default function CreateEvent(props: Props) {
  const [event, setEvent] = useState(props.event);
  const [rRule, setRRule] = useState(event.recurrenceRule);
  const [recurrenceModalType, setRecurrenceModalType] = useState("save");

  const [isPrivate, setIsPrivate] = useState(event.visibility === "private");
  const [title, setTitle] = useState(event.title || "");
  const [description, setDescription] = useState(event.description || "");

  const [allDay, setAllDay] = useState(event.allDay ?? false);
  const [recurring, setRecurring] = useState((event.recurrenceRule?.length ?? 0) > 0);

  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);

  const [startDate, setStartDate] = useState(new Date(event.start || Date.now()));
  const [endDate, setEndDate] = useState(new Date(event.end || Date.now()));

  const [showEventEditModal, setShowEventEditModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (props.event.recurrenceRule) setRecurrenceModalType("save");
    else {
      const ev = { ...event };

      if (!ev.title || ev.title === "") {
        Alert.alert("Please enter a title");
        return;
      }

      ev.recurrenceRule = rRule;
      setLoading(true);
      ApiHelper.post("/events", [ev], "ContentApi").then(() => {
        setLoading(false);
        if (props.onDone) props.onDone();
      });
    }
  };

  const handleRecurringSave = async (editType: string) => {
    switch (editType) {
      case "this":
        {
          const exception: EventExceptionInterface = { eventId: event.id, exceptionDate: event.start };
          ApiHelper.post("/eventExceptions", [exception], "ContentApi").then(() => {
            const oneEv = { ...event };
            oneEv.id = undefined;
            oneEv.recurrenceRule = undefined;
            ApiHelper.post("/events", [oneEv], "ContentApi").then(() => {
              if (props.onDone) props.onDone();
              setShowEventEditModal(false);
            });
          });
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
          ApiHelper.post("/events", [originalEv, newEvent], "ContentApi").then(() => {
            if (props.onDone) props.onDone();
            setShowEventEditModal(false);
          });
        }
        break;
      case "all":
        {
          const allEv = { ...event };
          allEv.recurrenceRule = rRule;
          ApiHelper.post("/events", [allEv], "ContentApi").then(() => {
            if (props.onDone) props.onDone();
            setShowEventEditModal(false);
          });
        }
        break;
    }
  };

  const handleRecurringDelete = (editType: string) => {
    switch (editType) {
      case "this": {
        const exception: EventExceptionInterface = { eventId: event.id, exceptionDate: event.start };
        ApiHelper.post("/eventExceptions", [exception], "ContentApi").then(() => {
          if (props.onDone) props.onDone();
          setShowEventEditModal(false);
        });
        break;
      }
      case "future": {
        const ev = { ...event };
        const rrule = EventHelper.getFullRRule(ev);
        rrule.options.until = ev.start ? new Date(ev.start) : new Date();
        ev.start = props.event.start; //Keep the original start date, not this instance's start date
        event.recurrenceRule = EventHelper.getPartialRRuleString(rrule.options);
        ApiHelper.post("/events", [event], "ContentApi").then(() => {
          if (props.onDone) props.onDone();
          setShowEventEditModal(false);
        });
        break;
      }
      case "all": {
        ApiHelper.delete("/events/" + event.id, "ContentApi").then(() => {
          if (props.onDone) props.onDone();
          setShowEventEditModal(false);
        });
        break;
      }
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
  };

  const handleChange = (type: string, e: Date) => {
    const env = { ...event };
    switch (type) {
      case "start":
        env.start = DateHelper.toDate(e);
        break;
      case "end":
        env.end = DateHelper.toDate(e);
        break;
    }
    setEvent(env);
  };


  const handleDelete = async () => {
    if (props.event.recurrenceRule) {
      setRecurrenceModalType("delete");
      setShowEventEditModal(true);
    } else {
      ApiHelper.delete("/events/" + event.id, "ContentApi").then(() => {
        if (props.onDone) props.onDone();
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
    <PaperProvider theme={theme}>
      <Portal>
        <Modal visible={true} onDismiss={() => props.onDone?.()} contentContainerStyle={styles.modalContainer}>
          <Card style={styles.modalCard}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text variant="headlineSmall" style={styles.modalTitle}>
                {event?.id ? "Edit Event" : "Create Event"}
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => props.onDone?.()}
                style={styles.closeButton}
              />
            </View>

            <Divider />

            {/* Content */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Title */}
              <View style={styles.fieldContainer}>
                <Text variant="titleMedium" style={styles.fieldLabel}>Event Title</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Enter event title"
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
                <Text variant="titleMedium" style={styles.fieldLabel}>Description</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Enter event description (optional)"
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

              {/* Options */}
              <View style={styles.fieldContainer}>
                <Text variant="titleMedium" style={styles.fieldLabel}>Options</Text>
                
                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Text variant="bodyLarge" style={styles.optionTitle}>All Day Event</Text>
                    <Text variant="bodySmall" style={styles.optionSubtitle}>Event lasts the entire day</Text>
                  </View>
                  <Switch
                    value={allDay}
                    onValueChange={value => {
                      setAllDay(value);
                      setEvent({ ...event, allDay: value });
                    }}
                    color={theme.colors.primary}
                  />
                </View>

                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Text variant="bodyLarge" style={styles.optionTitle}>Recurring Event</Text>
                    <Text variant="bodySmall" style={styles.optionSubtitle}>Event repeats on a schedule</Text>
                  </View>
                  <Switch
                    value={recurring}
                    onValueChange={handleToggleRecurring}
                    color={theme.colors.primary}
                  />
                </View>

                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Text variant="bodyLarge" style={styles.optionTitle}>Private Event</Text>
                    <Text variant="bodySmall" style={styles.optionSubtitle}>Only visible to group leaders</Text>
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
                    color={theme.colors.primary}
                  />
                </View>
              </View>

              {/* Date and Time */}
              <View style={styles.fieldContainer}>
                <Text variant="titleMedium" style={styles.fieldLabel}>
                  {allDay ? "Date" : "Date & Time"}
                </Text>
                
                <View style={styles.dateTimeContainer}>
                  <View style={styles.dateTimeRow}>
                    <Text variant="bodyMedium" style={styles.dateTimeLabel}>Start</Text>
                    <Button
                      mode="outlined"
                      onPress={() => setOpenStartPicker(true)}
                      style={styles.dateTimeButton}
                      contentStyle={styles.dateTimeButtonContent}
                    >
                      <MaterialIcons name="event" size={16} color={theme.colors.primary} />
                      <Text style={styles.dateTimeText}>
                        {allDay 
                          ? dayjs(startDate).format("MMM DD, YYYY")
                          : dayjs(startDate).format("MMM DD, YYYY HH:mm")
                        }
                      </Text>
                    </Button>
                  </View>

                  <View style={styles.dateTimeRow}>
                    <Text variant="bodyMedium" style={styles.dateTimeLabel}>End</Text>
                    <Button
                      mode="outlined"
                      onPress={() => setOpenEndPicker(true)}
                      style={styles.dateTimeButton}
                      contentStyle={styles.dateTimeButtonContent}
                    >
                      <MaterialIcons name="event" size={16} color={theme.colors.primary} />
                      <Text style={styles.dateTimeText}>
                        {allDay 
                          ? dayjs(endDate).format("MMM DD, YYYY")
                          : dayjs(endDate).format("MMM DD, YYYY HH:mm")
                        }
                      </Text>
                    </Button>
                  </View>
                </View>
              </View>

              {/* Recurrence Rule Editor */}
              {event?.recurrenceRule && event.recurrenceRule.length > 0 && (
                <View style={styles.fieldContainer}>
                  <Text variant="titleMedium" style={styles.fieldLabel}>Recurrence Pattern</Text>
                  <RRuleEditor
                    start={event.start || new Date()}
                    rRule={event.recurrenceRule || ""}
                    onChange={(rRule: string) => {
                      setRRule(rRule);
                    }}
                  />
                </View>
              )}
            </ScrollView>

            <Divider />

            {/* Actions */}
            <View style={styles.modalActions}>
              {!event?.id ? (
                <>
                  <Button
                    mode="outlined"
                    onPress={() => props.onDone?.()}
                    style={styles.actionButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSave}
                    loading={loading}
                    disabled={!title.trim() || loading}
                    style={styles.actionButton}
                  >
                    Create Event
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    mode="outlined"
                    onPress={handleDelete}
                    textColor={theme.colors.error}
                    style={styles.actionButton}
                  >
                    Delete
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleEditEvent}
                    loading={loading}
                    disabled={!title.trim() || loading}
                    style={styles.actionButton}
                  >
                    Save Changes
                  </Button>
                </>
              )}
            </View>
          </Card>

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
        </Modal>
      </Portal>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalCard: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16
  },
  modalTitle: {
    color: "#3c3c3c",
    fontWeight: "600"
  },
  closeButton: {
    margin: 0
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24
  },
  fieldContainer: {
    marginVertical: 16
  },
  fieldLabel: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 8
  },
  textInput: {
    backgroundColor: "#FFFFFF"
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  optionInfo: {
    flex: 1
  },
  optionTitle: {
    color: "#3c3c3c",
    fontWeight: "500",
    marginBottom: 2
  },
  optionSubtitle: {
    color: "#9E9E9E"
  },
  dateTimeContainer: {
    marginTop: 8
  },
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
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12
  },
  actionButton: {
    minWidth: 100
  }
});

import { EventHelper } from "@churchapps/helpers/src/EventHelper";
import { ApiHelper, DateHelper, EventExceptionInterface, EventInterface } from "@churchapps/mobilehelper";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import dayjs from "dayjs";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { globalStyles } from "../../../src/helpers";
import CheckBox from "../CheckBox";
import { CustomModal } from "../modals/CustomModal";
import EditRecurringModal from "./EditRecurringModal";
import RRuleEditor from "./RRuleEditor";

interface Props {
  event: EventInterface;
  onDone?: () => void;
}

export default function CreateEvent(props: Props) {
  const [event, setEvent] = useState(props.event);
  const [rRule, setRRule] = useState(event.recurrenceRule);
  const [recurrenceModalType, setRecurrenceModalType] = useState("save");

  const [isEnabled, setIsEnabled] = useState(event.visibility === "private");
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);

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

  const getDates = () => {
    if (event.allDay)
      return (
        <>
          <View style={styles.eventType}>
            <View style={styles.dateConatiner}>
              <Text style={styles.dateText} numberOfLines={1}>
                {dayjs(startDate).format("YYYY-MM-DD")}
              </Text>
              <Icon name={"calendar-o"} style={globalStyles.selectionIcon} size={DimensionHelper.wp(6)} onPress={() => setOpenStartPicker(true)} />
              <DatePicker
                modal
                open={openStartPicker}
                date={startDate}
                onConfirm={date => {
                  setOpenStartPicker(false);
                  setStartDate(date);
                  handleChange("start", date);
                }}
                onCancel={() => {
                  setOpenStartPicker(false);
                }}
              />
            </View>
            <View style={styles.dateConatiner}>
              <Text style={styles.dateText} numberOfLines={1}>
                {dayjs(endDate).format("YYYY-MM-DD")}
              </Text>
              <Icon name={"calendar-o"} style={globalStyles.selectionIcon} size={DimensionHelper.wp(6)} onPress={() => setOpenEndPicker(true)} />
              <DatePicker
                modal
                open={openEndPicker}
                date={endDate}
                onConfirm={date => {
                  setOpenEndPicker(false);
                  setEndDate(date);
                  handleChange("end", date);
                }}
                onCancel={() => {
                  setOpenEndPicker(false);
                }}
              />
            </View>
          </View>
        </>
      );
    else
      return (
        <>
          <View style={styles.eventType}>
            <View style={styles.dateConatiner}>
              <Text style={styles.dateText} numberOfLines={1}>
                {dayjs(startDate).format("YYYY-MM-DD")}
              </Text>
              <Icon name={"calendar-o"} style={globalStyles.selectionIcon} size={DimensionHelper.wp(6)} onPress={() => setOpenStartPicker(true)} />
              <DatePicker
                modal
                open={openStartPicker}
                date={startDate}
                onConfirm={date => {
                  setOpenStartPicker(false);
                  setStartDate(date);
                  handleChange("start", date);
                }}
                onCancel={() => {
                  setOpenStartPicker(false);
                }}
              />
            </View>
            <View style={styles.dateConatiner}>
              <Text style={styles.dateText} numberOfLines={1}>
                {dayjs(endDate).format("YYYY-MM-DD")}
              </Text>
              <Icon name={"calendar-o"} style={globalStyles.selectionIcon} size={DimensionHelper.wp(6)} onPress={() => setOpenEndPicker(true)} />
              <DatePicker
                modal
                open={openEndPicker}
                date={endDate}
                onConfirm={date => {
                  setOpenEndPicker(false);
                  setEndDate(date);
                  handleChange("end", date);
                }}
                onCancel={() => {
                  setOpenEndPicker(false);
                }}
              />
            </View>
          </View>
        </>
      );
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
    <View>
      <View style={styles.eventType}>
        <CheckBox
          onPress={() => {
            setAllDay(!allDay), setEvent({ ...event, allDay: !allDay });
          }}
          title="All Day"
          isChecked={allDay}
        />
        <CheckBox
          onPress={() => {
            handleToggleRecurring(!recurring);
          }}
          title="Recurring"
          isChecked={recurring}
        />
      </View>
      <View style={styles.dateTextConatiner}>
        <Text style={styles.labelText}>Start Time</Text>
        <Text style={styles.labelText}>End Time</Text>
      </View>
      {getDates()}
      <View style={styles.visibilityConatiner}>
        <Text style={styles.labelText}>Private: </Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={value => {
            setIsEnabled(value);
            setEvent(prev => ({
              ...prev,
              visibility: value ? "private" : "public"
            }));
          }}
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          value={isEnabled}
        />
      </View>
      {event?.recurrenceRule && event.recurrenceRule.length > 0 && (
        <RRuleEditor
          start={event.start || new Date()}
          rRule={event.recurrenceRule || ""}
          onChange={(rRule: string) => {
            setRRule(rRule);
          }}
        />
      )}
      <Text style={[styles.labelText, { marginTop: DimensionHelper.wp(3.5) }]}>Title</Text>
      <TextInput
        style={[
          globalStyles.textInputStyle,
          {
            width: DimensionHelper.wp(88),
            borderWidth: 1,
            padding: 10,
            borderRadius: 10,
            borderColor: "lightgray",
            marginTop: DimensionHelper.wp(1)
          }
        ]}
        placeholder={"Title"}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="numeric"
        placeholderTextColor={"lightgray"}
        value={title}
        onChangeText={text => {
          setTitle(text);
          setEvent(prev => ({ ...prev, title: text }));
        }}
      />
      <Text style={[styles.labelText, { marginTop: DimensionHelper.wp(3.5) }]}>Description</Text>
      <TextInput
        style={[
          globalStyles.textInputStyle,
          {
            width: DimensionHelper.wp(88),
            borderWidth: 1,
            padding: 10,
            borderRadius: 10,
            borderColor: "lightgray",
            marginTop: DimensionHelper.wp(1),
            height: DimensionHelper.wp(22)
          }
        ]}
        placeholder={"Description"}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="numeric"
        placeholderTextColor={"lightgray"}
        value={description}
        onChangeText={text => {
          setDescription(text);
          setEvent(prev => ({ ...prev, description: text }));
        }}
        multiline={true}
        numberOfLines={3}
      />
      {!event?.id ? (
        <TouchableOpacity style={[globalStyles.roundBlueButton, { width: DimensionHelper.wp(50) }]} onPress={handleSave}>
          {loading ? <ActivityIndicator size="small" color="white" animating={loading} /> : <Text style={globalStyles.roundBlueButtonText}>{"Save"}</Text>}
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <TouchableOpacity style={[globalStyles.roundBlueButton, { width: DimensionHelper.wp(40) }]} onPress={handleEditEvent}>
            <Text style={globalStyles.roundBlueButtonText}>{"Edit"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[globalStyles.roundBlueButton, { width: DimensionHelper.wp(40) }]} onPress={handleDelete}>
            <Text style={globalStyles.roundBlueButtonText}>{"Delete"}</Text>
          </TouchableOpacity>
        </View>
      )}
      <CustomModal width={DimensionHelper.wp(85)} isVisible={showEventEditModal} close={() => setShowEventEditModal(false)}>
        {recurrenceModalType && (
          <EditRecurringModal
            action={recurrenceModalType}
            setModal={setShowEventEditModal}
            onDone={editType => {
              recurrenceModalType === "delete" ? handleRecurringDelete(editType) : handleRecurringSave(editType);
            }}
          />
        )}
      </CustomModal>
    </View>
  );
}

const styles = StyleSheet.create({
  eventType: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  dateConatiner: {
    borderWidth: 1,
    paddingHorizontal: DimensionHelper.wp(2),
    borderColor: "lightgray",
    borderRadius: DimensionHelper.wp(2),
    height: DimensionHelper.wp(12),
    marginTop: DimensionHelper.wp(2),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  dateText: {
    width: DimensionHelper.wp(25),
    fontSize: DimensionHelper.wp(3.8)
  },
  labelText: {
    fontSize: DimensionHelper.wp(4),
    fontWeight: "600"
  },
  dateTextConatiner: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: DimensionHelper.wp(3.5)
  },
  visibilityConatiner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: DimensionHelper.wp(3.5)
  }
});

import * as React from "react";
import { EventHelper } from "@churchapps/helpers/src/EventHelper";
import { DateHelper } from "@churchapps/mobilehelper";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import moment from "moment";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";
import DropDownPicker from "react-native-dropdown-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { RRule, Weekday, rrulestr } from "rrule";
import { globalStyles } from "../../../src/helpers";

interface Props {
  start: Date;
  rRule: string;
  onChange: (rRuleString: string) => void;
}

export default function RRuleEditor(props: Props) {
  const initialOptions = props.rRule?.length > 0 ? rrulestr(props.rRule).options : new RRule({ dtstart: props.start }).options;
  initialOptions.byhour = [];
  initialOptions.byminute = [];
  initialOptions.bysecond = [];

  const [rRuleOptions, setRRuleOptions] = useState(initialOptions);
  const [interval, setInterval] = useState<string>(rRuleOptions.interval?.toString() || "");

  const [isFrequencyDropDownOpen, setIsFrequencyDropDownOpen] = useState(false);
  const [selectFrequency, setSelectFrequency] = useState(rRuleOptions.freq.toString());
  const [frequencyItems, setFrequencyItems] = useState([
    { label: "Day", value: RRule.DAILY.toString() },
    { label: "Week", value: RRule.WEEKLY.toString() },
    { label: "Month", value: RRule.MONTHLY.toString() }
  ]);
  const [isFrequencyOnDropDownOpen, setIsFrequencyOnDropDownOpen] = useState(false);
  const [selectOn, setSlecton] = useState(null);

  const [isEndsDropDownOpen, setIsEndsDropDownOpen] = useState(false);
  const [selectEnds, setSelectEnds] = useState(rRuleOptions.count ? "count" : rRuleOptions.until ? "until" : "never");
  const [endsItems, setEndsItems] = useState([
    { label: "Never", value: "never" },
    { label: "On", value: "until" },
    { label: "After", value: "count" }
  ]);

  const [onEndDate, setOnEndDate] = useState(rRuleOptions.until || new Date());
  const [openOnEndPicker, setonEndPicker] = useState(false);
  const [occurances, setOccurances] = useState<string>(rRuleOptions.count?.toString() || "");

  const handleChange = (type: string, e: any) => {
    const options = { ...rRuleOptions };
    switch (type) {
      case "freq":
        options.freq = parseInt(e);
        if (options.freq === RRule.WEEKLY || options.freq === RRule.DAILY) {
          options.bymonthday = [];
          options.bynweekday = [];
          options.byweekday = [];
          let startDay = props.start.getDay() - 1;
          if (startDay === -1) startDay = 6;
          options.byweekday = [startDay];
        } else if (options.freq === RRule.MONTHLY) {
          options.bymonthday = [props.start.getDate() || 1];
          options.bynweekday = [];
          options.byweekday = [];
        }
        break;
      case "interval":
        options.interval = parseInt(e);
        break;
    }
    setRRuleOptions(options);
  };

  const handleMonthOptionChange = (mode: string, monthDay: number, nthWeekday: number, weekday: number) => {
    const options = { ...rRuleOptions };
    switch (mode) {
      case "monthDay":
        options.bymonthday = [monthDay];
        options.bynweekday = [];
        break;
      case "nthWeekday":
        options.bymonthday = [];
        options.byweekday = [weekday === 0 ? 6 : weekday - 1]; //to handle (MO, TU, WE..) day of the week
        options.bysetpos = [nthWeekday + 1]; //to handle (first, second, third..) nth day of the week
        break;
    }
    setRRuleOptions(options);
  };

  const handleWeekDayClick = (value: Weekday) => {
    const options = { ...rRuleOptions };
    if (!options.byweekday) options.byweekday = [];
    let selected = rRuleOptions.byweekday?.includes(value.weekday);
    if (!selected) options.byweekday.push(value.weekday);
    else options.byweekday = options.byweekday.filter(x => x !== value.weekday);
    setRRuleOptions(options);
  };

  const getDayButton = (value: Weekday, label: string) => {
    let selected = rRuleOptions.byweekday?.includes(value.weekday);
    return (
      <TouchableOpacity
        key={value.toString()}
        style={[styles.dayButton, selected && styles.selectedDayButton]}
        onPress={() => {
          handleWeekDayClick(value);
        }}>
        <Text style={[styles.dayButtonText, selected && styles.selectedDayText]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const getFreqFollowUp = () => {
    let result = <></>;
    switch (rRuleOptions.freq.toString()) {
      case RRule.WEEKLY.toString():
        result = (
          <>
            <View style={styles.buttonGroup}>
              {getDayButton(RRule.SU, "S")}
              {getDayButton(RRule.MO, "M")}
              {getDayButton(RRule.TU, "T")}
              {getDayButton(RRule.WE, "W")}
              {getDayButton(RRule.TH, "T")}
              {getDayButton(RRule.FR, "F")}
              {getDayButton(RRule.SA, "S")}
            </View>
          </>
        );
        break;
      case RRule.MONTHLY.toString():
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const ordinals = ["first", "second", "third", "fourth", "last"];
        // const dayOfMonth = props.start.getDate() || 1;
        // const dayOfWeek = props.start.getDay() || 0;
        const startDate = new Date(props.start);
        const dayOfMonth = startDate.getDate() || 1;
        const dayOfWeek = startDate.getDay() || 0;
        const ordinal = Math.floor((dayOfMonth - 1) / 7);
        result = (
          <>
            <View>
              <Text style={styles.label}>On</Text>
              <DropDownPicker
                listMode="MODAL"
                open={isFrequencyOnDropDownOpen}
                value={rRuleOptions.bymonthday?.length > 0 ? "monthDay" : "nthWeekday"}
                items={[
                  { label: `Monthly on day ${dayOfMonth}`, value: "monthDay" },
                  {
                    label: `Monthly on the ${ordinals[ordinal]} ${daysOfWeek[dayOfWeek]}`,
                    value: "nthWeekday"
                  }
                ]}
                setOpen={setIsFrequencyOnDropDownOpen}
                setValue={setSlecton}
                onSelectItem={e => {
                  handleMonthOptionChange(e.value || "", dayOfMonth, ordinal, dayOfWeek);
                }}
                style={globalStyles.dropDownMainStyle}
                labelStyle={globalStyles.labelStyle}
                dropDownContainerStyle={globalStyles.dropDownStyle}
              />
            </View>
          </>
        );
        break;
    }
    return result;
  };

  const handleEndsChange = (e: any) => {
    const options = { ...rRuleOptions };
    switch (e) {
      case "never":
        options.count = null;
        options.until = null;
        break;
      case "count":
        options.count = 1;
        options.until = null;
        break;
      case "until":
        options.count = null;
        options.until = new Date();
        break;
    }
    setRRuleOptions(options);
  };

  const handleEndFollowupChange = (type: string, e: any) => {
    const options = { ...rRuleOptions };
    switch (type) {
      case "until":
        options.until = DateHelper.toDate(e);
        break;
      case "count":
        options.count = parseInt(e);
        break;
    }
    setRRuleOptions(options);
  };

  const getEndsFollowUp = () => {
    let result: React.ReactElement = <></>;
    switch (selectEnds) {
      case "until":
        result = (
          <>
            <Text style={styles.labelText}>End Date</Text>
            <View style={styles.dateConatiner}>
              <Text style={styles.dateText} numberOfLines={1}>
                {moment(onEndDate).format("YYYY-MM-DD")}
              </Text>
              <Icon name={"calendar-o"} style={globalStyles.selectionIcon} size={DimensionHelper.wp(6)} onPress={() => setonEndPicker(true)} />
              <DatePicker
                modal
                mode="date"
                open={openOnEndPicker}
                date={onEndDate}
                onConfirm={date => {
                  setonEndPicker(false);
                  setOnEndDate(date);
                  handleEndFollowupChange("until", date);
                }}
                onCancel={() => {
                  setonEndPicker(false);
                }}
              />
            </View>
          </>
        );
        break;
      case "count":
        result = (
          <>
            <Text style={styles.labelText}>Occurances</Text>
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
              placeholder={"Occurances"}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numeric"
              placeholderTextColor={"lightgray"}
              value={occurances}
              onChangeText={text => {
                setOccurances(text), handleEndFollowupChange("count", text);
              }}
            />
          </>
        );
        break;
    }
    return result;
  };

  useEffect(() => {
    const result = EventHelper.getPartialRRuleString(rRuleOptions);
    props.onChange(result);
  }, [rRuleOptions]);

  return (
    <View>
      <Text style={styles.labelText}>Interval</Text>
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
        placeholder={"Interval"}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="numeric"
        placeholderTextColor={"lightgray"}
        value={interval}
        onChangeText={text => {
          setInterval(text), handleChange("interval", text);
        }}
      />
      <Text style={styles.labelText}>Frequency</Text>
      <DropDownPicker
        listMode="MODAL"
        open={isFrequencyDropDownOpen}
        value={selectFrequency}
        items={frequencyItems}
        setOpen={setIsFrequencyDropDownOpen}
        setValue={setSelectFrequency}
        onChangeValue={e => {
          handleChange("freq", e);
        }}
        setItems={setFrequencyItems}
        containerStyle={{
          height: DimensionHelper.wp(10),
          width: DimensionHelper.wp(88),
          marginTop: DimensionHelper.wp(1)
        }}
        style={globalStyles.dropDownMainStyle}
        labelStyle={globalStyles.labelStyle}
        dropDownContainerStyle={globalStyles.dropDownStyle}
        scrollViewProps={{ scrollEnabled: true }}
        dropDownDirection="BOTTOM"
      />
      {getFreqFollowUp()}
      <Text style={styles.labelText}>Ends</Text>
      <DropDownPicker
        listMode="MODAL"
        open={isEndsDropDownOpen}
        value={selectEnds}
        items={endsItems}
        setOpen={setIsEndsDropDownOpen}
        setValue={setSelectEnds}
        setItems={setEndsItems}
        onChangeValue={e => {
          handleEndsChange(e);
        }}
        containerStyle={{
          height: DimensionHelper.wp(10),
          width: DimensionHelper.wp(88),
          marginTop: DimensionHelper.wp(1)
        }}
        style={globalStyles.dropDownMainStyle}
        labelStyle={globalStyles.labelStyle}
        dropDownContainerStyle={globalStyles.dropDownStyle}
        scrollViewProps={{ scrollEnabled: true }}
        dropDownDirection="BOTTOM"
      />
      {getEndsFollowUp()}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    // marginVertical: 10,
    marginTop: DimensionHelper.wp(3.5)
    // marginBottom: 0
  },
  label: {
    fontSize: DimensionHelper.wp(4),
    marginBottom: DimensionHelper.wp(1),
    color: "#333",
    marginTop: DimensionHelper.wp(3.5),
    fontWeight: "600"
  },
  dayButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "lightgray"
  },
  selectedDayButton: {
    backgroundColor: "#2196F3",
    borderColor: "#1976D2"
  },
  dayButtonText: {
    color: "#000"
  },
  selectedDayText: {
    color: "#fff"
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
    marginTop: DimensionHelper.wp(3.5),
    fontSize: DimensionHelper.wp(4),
    fontWeight: "600"
  }
});

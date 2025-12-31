import * as React from "react";
import { EventHelper, DateHelper } from "@churchapps/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import dayjs from "dayjs";
import { useEffect, useState, useMemo } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";
import DropDownPicker from "react-native-dropdown-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RRule, Weekday, rrulestr } from "rrule";
import { globalStyles } from "../../../src/helpers";
import { useTranslation } from "react-i18next";

interface Props {
  start: Date;
  rRule: string;
  onChange: (rRuleString: string) => void;
}

export default function RRuleEditor(props: Props) {
  const { t } = useTranslation();
  const initialOptions = props.rRule?.length > 0 ? rrulestr(props.rRule).options : new RRule({ dtstart: props.start }).options;
  initialOptions.byhour = [];
  initialOptions.byminute = [];
  initialOptions.bysecond = [];

  const [rRuleOptions, setRRuleOptions] = useState(initialOptions);
  const [interval, setInterval] = useState<string>(rRuleOptions.interval?.toString() || "");

  const [isFrequencyDropDownOpen, setIsFrequencyDropDownOpen] = useState(false);
  const [selectFrequency, setSelectFrequency] = useState(rRuleOptions.freq.toString());
  const [frequencyItems, setFrequencyItems] = useState([
    { label: t("events.day"), value: RRule.DAILY.toString() },
    { label: t("events.week"), value: RRule.WEEKLY.toString() },
    { label: t("events.month"), value: RRule.MONTHLY.toString() }
  ]);
  const [isFrequencyOnDropDownOpen, setIsFrequencyOnDropDownOpen] = useState(false);

  const [isEndsDropDownOpen, setIsEndsDropDownOpen] = useState(false);
  const [selectEnds, setSelectEnds] = useState(rRuleOptions.count ? "count" : rRuleOptions.until ? "until" : "never");
  const [endsItems, setEndsItems] = useState([
    { label: t("events.never"), value: "never" },
    { label: t("events.on"), value: "until" },
    { label: t("events.after"), value: "count" }
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
              {getDayButton(RRule.SU, t("events.sunAbbr"))}
              {getDayButton(RRule.MO, t("events.monAbbr"))}
              {getDayButton(RRule.TU, t("events.tueAbbr"))}
              {getDayButton(RRule.WE, t("events.wedAbbr"))}
              {getDayButton(RRule.TH, t("events.thuAbbr"))}
              {getDayButton(RRule.FR, t("events.friAbbr"))}
              {getDayButton(RRule.SA, t("events.satAbbr"))}
            </View>
          </>
        );
        break;
      case RRule.MONTHLY.toString(): {
        const daysOfWeek = [t("events.sunday"), t("events.monday"), t("events.tuesday"), t("events.wednesday"), t("events.thursday"), t("events.friday"), t("events.saturday")];
        const ordinals = [t("events.first"), t("events.second"), t("events.third"), t("events.fourth"), t("events.last")];
        // const dayOfMonth = props.start.getDate() || 1;
        // const dayOfWeek = props.start.getDay() || 0;
        const startDate = new Date(props.start);
        const dayOfMonth = startDate.getDate() || 1;
        const dayOfWeek = startDate.getDay() || 0;
        const ordinal = Math.floor((dayOfMonth - 1) / 7);
        result = (
          <>
            <View>
              <Text style={styles.label}>{t("events.on")}</Text>
              <DropDownPicker
                listMode="MODAL"
                open={isFrequencyOnDropDownOpen}
                value={rRuleOptions.bymonthday?.length > 0 ? "monthDay" : "nthWeekday"}
                items={[
                  { label: t("events.monthlyOnDay", { day: dayOfMonth }), value: "monthDay" },
                  {
                    label: t("events.monthlyOnThe", { nthOrdinal: ordinals[ordinal], weekday: daysOfWeek[dayOfWeek] }),
                    value: "nthWeekday"
                  }
                ]}
                setOpen={setIsFrequencyOnDropDownOpen}
                setValue={() => {}}
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
            <Text style={styles.labelText}>{t("events.endDate")}</Text>
            <View style={styles.dateConatiner}>
              <Text style={styles.dateText} numberOfLines={1}>
                {dayjs(onEndDate).format("YYYY-MM-DD")}
              </Text>
              <MaterialIcons name={"calendar-today"} style={globalStyles.selectionIcon} size={DimensionHelper.wp(6)} onPress={() => setonEndPicker(true)} />
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
            <Text style={styles.labelText}>{t("events.occurrences")}</Text>
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
              placeholder={t("events.occurrences")}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numeric"
              placeholderTextColor={"lightgray"}
              value={occurances}
              onChangeText={text => {
                (setOccurances(text), handleEndFollowupChange("count", text));
              }}
            />
          </>
        );
        break;
    }
    return result;
  };

  const rRuleString = useMemo(() => EventHelper.getPartialRRuleString(rRuleOptions), [rRuleOptions]);

  useEffect(() => {
    props.onChange(rRuleString);
  }, [rRuleString, props.onChange]);

  return (
    <View>
      <Text style={styles.labelText}>{t("events.interval")}</Text>
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
        placeholder={t("events.interval")}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="numeric"
        placeholderTextColor={"lightgray"}
        value={interval}
        onChangeText={text => {
          (setInterval(text), handleChange("interval", text));
        }}
      />
      <Text style={styles.labelText}>{t("events.frequency")}</Text>
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
      <Text style={styles.labelText}>{t("events.ends")}</Text>
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

import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import moment from "moment";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import CheckIcon from "react-native-vector-icons/Feather";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import ErrorIcon from "react-native-vector-icons/MaterialIcons";
import { ApiHelper, Constants, PositionInterface, TimeInterface, globalStyles } from "@/src/helpers";

interface Props {
  position: PositionInterface;
  assignment: any;
  times: TimeInterface[];
  onUpdate: () => void;
}

export const PositionDetails = ({ position, assignment, times, onUpdate }: Props) => {
  const getStatus = () => {
    switch (assignment.status) {
      case "Accepted":
        return (
          <View style={[globalStyles.statusView, { backgroundColor: Constants.Colors.Light_Green }]} key={assignment.id}>
            <View style={globalStyles.PlanIconTitleView}>
              <CheckIcon name="check-circle" style={{ color: Constants.Colors.Dark_Green }} size={DimensionHelper.wp(5.5)} />
              <Text style={[globalStyles.planTextStyle, globalStyles.StatusTextStyle]}>Status:</Text>
            </View>
            <Text style={globalStyles.planTextStyle}> Accepted</Text>
          </View>
        );
      case "Declined":
        return (
          <View style={[globalStyles.statusView, { backgroundColor: Constants.Colors.Light_Red }]} key={assignment.id}>
            <View style={globalStyles.PlanIconTitleView}>
              <ErrorIcon name="error-outline" style={{ color: Constants.Colors.app_color }} size={DimensionHelper.wp(5.5)} />
              <Text style={[globalStyles.planTextStyle, globalStyles.StatusTextStyle]}>Status:</Text>
            </View>
            <Text style={globalStyles.planTextStyle}> Declined</Text>
          </View>
        );
      default:
        return (
          <View style={[globalStyles.statusView, { backgroundColor: Constants.Colors.Light_Red }]} key={assignment.id}>
            <View style={globalStyles.PlanIconTitleView}>
              <Icon name="warning" style={{ color: Constants.Colors.button_red }} size={DimensionHelper.wp(5.5)} />
              <Text style={[globalStyles.planTextStyle, globalStyles.StatusTextStyle]}>Status:</Text>
            </View>
            <Text style={globalStyles.planTextStyle}> Unconfirmed</Text>
          </View>
        );
    }
  };
  const getTimes = () => {
    const timeData = times.sort((a: any, b: any) => (a.startTime > b.startTime ? 1 : -1));
    return timeData.map((time: any) => {
      const startDate = moment(time.startTime);
      const endDate = moment(time.endTime);
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatTime(endDate);
      return (
        <View key={time.id} style={{ marginTop: DimensionHelper.hp(1) }}>
          <Text style={[globalStyles.planTextStyle, { fontFamily: Constants.Fonts.RobotoBold }]}>{`• ${time.displayName}`}</Text>
          <Text style={[globalStyles.planTextStyle, { marginLeft: DimensionHelper.wp(4), color: "#555" }]}>
            {formattedStartDate} - {formattedEndDate}
          </Text>
        </View>
      );
    });
  };

  const formatDate = (date: any) => date.format("MMM DD, YYYY h:mm A");
  const formatTime = (date: any) => date.format("h:mm A");

  const handleAccept = () => {
    ApiHelper.post("/assignments/accept/" + assignment.id, [], "DoingApi").then(() => {
      onUpdate();
    });
  };

  const handleDecline = () => {
    ApiHelper.post("/assignments/decline/" + assignment.id, [], "DoingApi").then(() => {
      onUpdate();
    });
  };

  let latestTime = new Date();
  times.forEach((time: any) => {
    if (new Date(time.endTime) > latestTime) latestTime = new Date(time.endTime);
  });

  const canRespond = assignment.status === "Unconfirmed" && (times.length === 0 || new Date() < latestTime);

  return (
    <View key={position.id}>
      <View style={globalStyles.FlatlistViewStyle}>
        <View style={globalStyles.planTitleView}>
          <Icons name="calendar" style={{ color: Constants.Colors.app_color }} size={DimensionHelper.wp(5.5)} />
          <Text style={[globalStyles.LatestUpdateTextStyle, { paddingLeft: DimensionHelper.wp(3), color: Constants.Colors.app_color }]}>Positions: {position?.name}</Text>
        </View>

        <View>{getStatus()}</View>

        <View style={globalStyles.neededTimeView}>
          <Text style={globalStyles.LatestUpdateTextStyle}>Needed Times:</Text>
          {getTimes()}
        </View>

        {canRespond ? (
          <View style={[globalStyles.CancelAddbuttonView, { marginHorizontal: DimensionHelper.wp(2), marginBottom: 0, justifyContent: "flex-end" }]}>
            <TouchableOpacity
              onPress={() => {
                handleDecline();
              }}>
              <Text style={{ color: Constants.Colors.button_red, fontSize: DimensionHelper.wp(3.8), marginRight: DimensionHelper.wp(2), textDecorationLine: "underline" }}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.SaveButtonStyle}
              onPress={() => {
                handleAccept();
              }}>
              <Text style={[globalStyles.ButtonTextStyle, { color: Constants.Colors.white_color }]}>Accept</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );
};

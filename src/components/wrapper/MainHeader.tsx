import { Constants, globalStyles } from "../../../src/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import React from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Entypo";
import { NotificationTab } from "../NotificationView";
import { HeaderBell } from "./HeaderBell";

interface Props {
  title: string;
  back?: () => void;
  openDrawer?: () => void;
  hideBell?: boolean;
}

export function MainHeader(props: Props) {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const insets = useSafeAreaInsets();

  const LeftComponent = () => (
    <View style={{ flexDirection: "row", justifyContent: Platform.OS == "ios" ? "space-around" : "flex-start", alignItems: "center" }}>
      {Platform.OS == "ios" && props.back && (
        <TouchableOpacity
          style={{ paddingHorizontal: DimensionHelper.wp(1) }}
          onPress={() => {
            if (props.back) props.back();
          }}>
          <Icon name={"chevron-left"} size={DimensionHelper.hp(3.5)} color={Constants.Colors.white_color} />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={() => {
          if (props.openDrawer) props.openDrawer();
        }}>
        <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <View style={[globalStyles.headerViewStyle, { paddingTop: insets.top }]}>
        <View style={[globalStyles.componentStyle, { flex: 2 }]}>{LeftComponent()}</View>
        <View style={[globalStyles.componentStyle, { flex: 6.3 }]}>
          <Text style={globalStyles.headerText}>{props.title}</Text>
        </View>
        <View style={[globalStyles.componentStyle, { flex: 1.7, justifyContent: "flex-end" }]}>
          {!props.hideBell && (
            <HeaderBell
              toggleNotifications={() => {
                setShowNotifications(!showNotifications);
              }}
            />
          )}
        </View>
      </View>
      {showNotifications && <NotificationTab />}
    </>
  );
}

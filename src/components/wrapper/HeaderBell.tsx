import { Constants, globalStyles } from "@/src/helpers";
import { eventBus } from "@/src/helpers/PushNotificationHelper";
import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import { useTheme } from 'react-native-paper';

interface Props {
  toggleNotifications: () => void;
}

export const HeaderBell = (props: Props) => {
  const [badgeCount, setBadgeCount] = useState(0);
  const theme = useTheme();
  const [routes] = React.useState([
    { key: 'first', title: 'MESSAGES' },
    { key: 'second', title: 'NOTIFICATIONS' },
  ]);

  const handleNewMessage = () => {
    setBadgeCount((prevCount) => prevCount + 1);
  };

  useEffect(() => {
    eventBus.addListener("badge", handleNewMessage);
    return () => { eventBus.removeListener("badge"); };
  });

  const iconStyle = {
    ...globalStyles.menuIcon,
    tintColor: theme.colors.primary
  };

  const badgeIconStyle = {
    ...globalStyles.BadgemenuIcon,
    tintColor: theme.colors.primary
  };

  return (
    <TouchableOpacity onPress={() => { setBadgeCount(0); props.toggleNotifications() }}>
      {badgeCount > 0 ? (
        <View style={{ flexDirection: 'row' }}>
          <Image source={Constants.Images.dash_bell} style={badgeIconStyle} />
          <View style={[globalStyles.BadgeDot, { backgroundColor: theme.colors.primary }]} />
        </View>
      ) : (
        <View>
          <Image source={Constants.Images.dash_bell} style={iconStyle} />
        </View>
      )}
    </TouchableOpacity>
  );
};

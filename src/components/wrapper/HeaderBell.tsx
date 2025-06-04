import { Constants, globalStyles } from "@/src/helpers";
import { eventBus } from "@/src/helpers/PushNotificationHelper";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { IconButton } from 'react-native-paper';
import { useAppTheme } from '@/src/theme';

interface Props {
  toggleNotifications: () => void;
}

export const HeaderBell = (props: Props) => {
  const { theme, componentStyles } = useAppTheme();
  const [badgeCount, setBadgeCount] = useState(0);
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

  return (
    <IconButton
      icon={badgeCount > 0 ? "bell-badge" : "bell"}
      iconColor={theme.colors.onPrimary}
      size={24}
      onPress={() => { setBadgeCount(0); props.toggleNotifications() }}
      style={componentStyles.button}
    />
  );
};

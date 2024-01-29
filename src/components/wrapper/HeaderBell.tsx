import { pushEventBus } from "@churchapps/mobilehelper";
import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Constants, globalStyles } from "../../helpers";

interface Props {
  toggleNotifications: () => void;
}

export const HeaderBell = (props: Props) => {
  const [badgeCount, setBadgeCount] = useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'MESSAGES' },
    { key: 'second', title: 'NOTIFICATIONS' },
  ]);

  

  const handleNewMessage = () => {
    setBadgeCount((prevCount) => prevCount + 1);
  };
  
  useEffect(() => {
    pushEventBus.addListener("badge", handleNewMessage);
    return () => { pushEventBus.removeListener("badge"); };
  });

  return (<>
    <TouchableOpacity onPress={() => { setBadgeCount(0); props.toggleNotifications() }}>
      {badgeCount > 0 ?
        <View style={{ flexDirection: 'row' }}>
          <Image source={Constants.Images.dash_bell} style={globalStyles.BadgemenuIcon} />
          <View style={globalStyles.BadgeDot}></View>
        </View>
        : <View>
          <Image source={Constants.Images.dash_bell} style={globalStyles.menuIcon} />
        </View>}
    </TouchableOpacity>
    
  </>);

  
}
import React, {useState} from "react";
import { Image, View, Dimensions, PixelRatio, Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Fontisto";
import { globalStyles } from "../helpers";
import { Constants } from "../helpers";

interface Props {
  navigation?: {
    navigate: (screenName: string, params?: any) => void;
    openDrawer?: () => void;
  };
  showBack : Boolean,
  showMenu : Boolean,
}

export function BlueHeader(props: Props) {    
  return (
    <View style={globalStyles.headerContainer}>
      <View style={globalStyles.blueLogoView}>
        {(props.showBack && props.navigation != undefined) ? <View style={globalStyles.blueMainBackIcon}>
          <TouchableOpacity onPressIn={() => { props?.navigation?.navigate("LoginScreen") }}>
            <Icon name={"angle-left"} color={Constants.Colors.white_color} style={globalStyles.inputIcon} size={wp("4.5%")}/>
          </TouchableOpacity>
        </View>  : null}
        {(props.showMenu && props.navigation?.openDrawer != undefined) ?
        <View style={[globalStyles.blueMainBackIcon, {marginTop : wp("6%"), marginLeft : wp("3%")}]}>
        <TouchableOpacity onPressIn={() => { props?.navigation?.openDrawer != undefined ? props?.navigation?.openDrawer() : null }}>
          <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
        </TouchableOpacity>
        </View> : null}
        <Image source={Constants.Images.logoWhite} style={globalStyles.blueMainIcon} />
      </View>
    </View>
  );
};

BlueHeader.defaultProps = {
  showBack : false,
  showMenu : false,
}

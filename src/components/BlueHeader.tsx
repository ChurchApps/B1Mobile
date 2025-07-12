import { Constants } from "@/helpers/Constants";
import { globalStyles } from "@/helpers/GlobalStyles";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import Icon from "@expo/vector-icons/Fontisto";
import { router } from "expo-router";
import { Image, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  navigation?: {
    navigate: (screenName: string, params?: Record<string, unknown>) => void;
    openDrawer?: () => void;
  };
  showBack: Boolean;
  showMenu: Boolean;
}

export function BlueHeader(props: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={globalStyles.headerContainer}>
      <View style={[globalStyles.blueLogoView, { paddingTop: insets.top }]}>
        {props.showBack && props.navigation != undefined ? (
          <View style={globalStyles.blueMainBackIcon}>
            <TouchableOpacity
              onPressIn={() => {
                router.back();
              }}>
              <Icon name={"angle-left"} color={Constants.Colors.white_color} style={globalStyles.inputIcon} size={DimensionHelper.wp(4.5)} />
            </TouchableOpacity>
          </View>
        ) : null}
        {props.showMenu && props.navigation?.openDrawer != undefined ? (
          <View style={[globalStyles.blueMainBackIcon, { marginTop: DimensionHelper.wp(6), marginLeft: DimensionHelper.wp(3) }]}>
            <TouchableOpacity
              onPressIn={() => {
                props?.navigation?.openDrawer != undefined ? props?.navigation?.openDrawer() : null;
              }}>
              <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
            </TouchableOpacity>
          </View>
        ) : null}
        <Image source={Constants.Images.logoWhite} style={globalStyles.blueMainIcon} />
      </View>
    </View>
  );
}

BlueHeader.defaultProps = {
  showBack: false,
  showMenu: false
};

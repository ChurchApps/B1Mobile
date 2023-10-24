import React, { useEffect } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/FontAwesome5";
import { WhiteHeader } from "../../components";
import { globalStyles, UserHelper } from "../../helpers";


interface Props {
  navigation: {
    navigate: (screenName: string) => void;
    goBack: () => void;
    openDrawer: () => void;
    addListener: (type: string, callback: any) => void;
  };
}

const CheckinCompleteScreen = (props: Props) => {
  const { navigate, goBack, openDrawer } = props.navigation;

  useEffect(() => {
    UserHelper.addOpenScreenEvent("CheckinCompleteScreen");
    serviceNavigate();
  }, []);

  useEffect(() => {
    serviceNavigate();
    const init = props.navigation.addListener("focus", async () => { serviceNavigate() });
    return init;
  }, [props.navigation]);

  const serviceNavigate = () => {
    setTimeout(() => { navigate("ServiceScreen") }, 1000);
  }

  return (
    <View style={globalStyles.grayContainer}>
      <ScrollView>
      <WhiteHeader onPress={() => openDrawer()} title="Checkin" />
      <SafeAreaView style={globalStyles.safeAreaContainer}>
        <Icon name={"check-circle"} style={globalStyles.successIcon} size={wp("20%")} />
        <Text style={globalStyles.successText}>Checkin Complete.</Text>
      </SafeAreaView>
      </ScrollView>
    </View>
  );
};

export default CheckinCompleteScreen;

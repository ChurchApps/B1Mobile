import React, { useState } from "react";
import { Image, SafeAreaView, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { MainHeader } from "../components";
import { CheckinServices } from "../components/checkin/CheckinServices";
import { Constants, globalStyles } from "../helpers";
import { NavigationProps } from "../interfaces";

interface Props {
  navigation: NavigationProps;
}

export const CheckinScreen = (props: Props) => {

  const [step, setStep] = useState("Services");
  

  const logoSrc = Constants.Images.logoBlue;
  return (
    <SafeAreaView style={globalStyles.grayContainer}>
      <MainHeader title="Checkin" openDrawer={props.navigation.openDrawer} />
      <ScrollView>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={logoSrc}><Image source={Constants.Images.logoBlue} style={globalStyles.whiteMainIcon} /></View>
          <CheckinServices onDone={() => setStep("Household")} />

          
        </SafeAreaView>
      </ScrollView>
    </SafeAreaView>
  );
};


import React, { useState } from "react";
import { Image, SafeAreaView, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { MainHeader } from "../components";
import { CheckinComplete, CheckinGroups, CheckinHousehold } from "../components/checkin";
import { CheckinServices } from "../components/checkin/CheckinServices";
import { CheckinHelper, Constants, PersonInterface, ServiceTimeInterface, globalStyles } from "../helpers";
import { NavigationProps } from "../interfaces";

interface Props {
  navigation: NavigationProps;
}

export const CheckinScreen = (props: Props) => {

  const [step, setStep] = useState("Services");
  const [groupMember, setGroupMember] = useState<PersonInterface>();
  const [groupTime, setGroupTime] = useState<ServiceTimeInterface>();
  
  const handleShowGroups = (member:PersonInterface, time:ServiceTimeInterface) => {
    setGroupMember(member);
    setGroupTime(time);
    setStep("Groups");
  }

  const clearData = () => {
    CheckinHelper.clearData();
    setGroupMember(undefined);
    setGroupTime(undefined);
    setStep("Services");
    props.navigation.navigate("Dashboard", {});
  }

  const logoSrc = Constants.Images.logoBlue;
  return (
    <SafeAreaView style={globalStyles.grayContainer}>
      <MainHeader title="Checkin" openDrawer={props.navigation.openDrawer} />
      <ScrollView>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={logoSrc}><Image source={Constants.Images.logoBlue} style={globalStyles.whiteMainIcon} /></View>
          {step==="Services" && <CheckinServices onDone={() => setStep("Household")} />}
          {step==="Household" && <CheckinHousehold showGroups={handleShowGroups} onDone={() => setStep("Complete")} />}
          {step==="Groups" && <CheckinGroups member={groupMember!} time={groupTime!} onDone={() => setStep("Household")} />}
          {step==="Complete" && <CheckinComplete onDone={clearData} /> }
          
        </SafeAreaView>
      </ScrollView>
    </SafeAreaView>
  );
};


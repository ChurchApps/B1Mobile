import { DimensionHelper } from "@churchapps/mobilehelper";
import React, { useState } from "react";
import { Image, SafeAreaView } from "react-native";
import { MainHeader } from "../components";
import { CheckinComplete, CheckinGroups, CheckinHousehold } from "../components/checkin";
import { CheckinServices } from "../components/checkin/CheckinServices";
import { CheckinHelper, Constants, PersonInterface, ServiceTimeInterface, UserHelper, globalStyles } from "../helpers";
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

  const getBrand = () => {
    
    if (UserHelper.churchAppearance?.logoLight) return <Image source={{ uri: UserHelper.churchAppearance?.logoLight }} style={{ width: "100%", height: DimensionHelper.wp(25) }} />
    else return <Image source={Constants.Images.logoBlue} style={globalStyles.whiteMainIcon} />
  }

  //const logoSrc = Constants.Images.logoBlue;

  
  return (
    <SafeAreaView style={globalStyles.grayContainer}>
      <MainHeader title="Checkin" openDrawer={props.navigation.openDrawer} />
        <SafeAreaView style={{ flex: 1 }}>
          {getBrand()}
          {step==="Services" && <CheckinServices onDone={() => setStep("Household")} />}
          {step==="Household" && <CheckinHousehold showGroups={handleShowGroups} onDone={() => setStep("Complete")} />}
          {step==="Groups" && <CheckinGroups member={groupMember!} time={groupTime!} onDone={() => setStep("Household")} />}
          {step==="Complete" && <CheckinComplete onDone={clearData} /> }
        </SafeAreaView>
    </SafeAreaView>
  );
};


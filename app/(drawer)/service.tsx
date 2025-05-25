import { CheckinHelper, Constants, PersonInterface, ServiceTimeInterface, UserHelper, globalStyles } from "@/src/helpers";
import { NavigationProps } from "@/src/interfaces";
import { DimensionHelper } from "@churchapps/mobilehelper";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { router, useNavigation } from "expo-router";
import React, { useState } from "react";
import { Image, SafeAreaView } from "react-native";
import { CheckinComplete, CheckinGroups, CheckinHousehold, CheckinServices } from "../_components/checkin/exports";
import { MainHeader } from "../_components/exports";

interface Props {
  navigation: NavigationProps;
}

const service = (props: Props) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [step, setStep] = useState("Services");
  const [groupMember, setGroupMember] = useState<PersonInterface>();
  const [groupTime, setGroupTime] = useState<ServiceTimeInterface>();

  const handleShowGroups = (member: PersonInterface, time: ServiceTimeInterface) => {
    setGroupMember(member);
    setGroupTime(time);
    setStep("Groups");
  }

  const clearData = () => {
    CheckinHelper.clearData();
    setGroupMember(undefined);
    setGroupTime(undefined);
    setStep("Services");
    router.navigate('/dashboard')
  }

  const getBrand = () => {

    if (UserHelper.churchAppearance?.logoLight) return <Image source={{ uri: UserHelper.churchAppearance?.logoLight }} style={{ width: "100%", height: DimensionHelper.wp(25) }} />
    else return <Image source={Constants.Images.logoBlue} style={globalStyles.whiteMainIcon} />
  }

  //const logoSrc = Constants.Images.logoBlue;


  return (
    <SafeAreaView style={globalStyles.grayContainer}>
      <MainHeader title="Checkin" openDrawer={navigation.openDrawer} back={navigation.goBack} />
      <SafeAreaView style={{ flex: 1 }}>
        {getBrand()}
        {step === "Services" && <CheckinServices onDone={() => setStep("Household")} />}
        {step === "Household" && <CheckinHousehold showGroups={handleShowGroups} onDone={() => setStep("Complete")} />}
        {step === "Groups" && <CheckinGroups member={groupMember!} time={groupTime!} onDone={() => setStep("Household")} />}
        {step === "Complete" && <CheckinComplete onDone={clearData} />}
      </SafeAreaView>
    </SafeAreaView>
  );
};
export default service

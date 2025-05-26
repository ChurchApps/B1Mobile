import { CheckinComplete } from "@/src/components/checkin/CheckinComplete";
import { CheckinGroups } from "@/src/components/checkin/CheckinGroups";
import { CheckinHousehold } from "@/src/components/checkin/CheckinHousehold";
import { CheckinServices } from "@/src/components/checkin/CheckinServices";
import { MainHeader } from "@/src/components/wrapper/MainHeader";
import { CheckinHelper, Constants, PersonInterface, ServiceTimeInterface, UserHelper, globalStyles } from "@/src/helpers";
import { NavigationProps } from "@/src/interfaces";
import { DimensionHelper } from "@churchapps/mobilehelper";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { useState } from "react";
import { Image, SafeAreaView } from "react-native";

interface Props {
  navigation: NavigationProps;
}

const Service = (props: Props) => {
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
export default Service

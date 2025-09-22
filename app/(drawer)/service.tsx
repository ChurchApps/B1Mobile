import React from "react";
import { CheckinGroups } from "../../src/components/checkin/CheckinGroups";
import { CheckinHousehold } from "../../src/components/checkin/CheckinHousehold";
import { CheckinServices } from "../../src/components/checkin/CheckinServices";
import { CheckinHelper, Constants, PersonInterface, ServiceTimeInterface } from "../../src/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation as useReactNavigation, DrawerActions } from "@react-navigation/native";
import { useNavigation } from "../../src/hooks";
import { useState } from "react";
import { SafeAreaView, View } from "react-native";
import { OptimizedImage } from "../../src/components/OptimizedImage";
import { useAppTheme } from "../../src/theme";
import { useChurchAppearance } from "../../src/stores/useUserStore";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { CheckinComplete } from "@/components/checkin/CheckinComplete";

const Service = () => {
  const { theme, spacing } = useAppTheme();
  const navigation = useReactNavigation<DrawerNavigationProp<any>>();
  const { navigateBack } = useNavigation();
  const [step, setStep] = useState("Services");
  const [groupMember, setGroupMember] = useState<PersonInterface>();
  const [groupTime, setGroupTime] = useState<ServiceTimeInterface>();
  const churchAppearance = useChurchAppearance();

  const handleShowGroups = (member: PersonInterface, time: ServiceTimeInterface) => {
    setGroupMember(member);
    setGroupTime(time);
    setStep("Groups");
  };

  const clearData = () => {
    CheckinHelper.clearData();
    setGroupMember(undefined);
    setGroupTime(undefined);
    setStep("Services");
    navigateBack();
  };

  const handleBack = () => {
    if (step === "Complete") {
      setStep("Household");
    } else if (step === "Groups") {
      setStep("Household");
    } else if (step === "Household") {
      setStep("Services");
    } else {
      navigateBack();
    }
  };

  const getBrand = () => {
    if (churchAppearance?.logoLight) return <OptimizedImage source={{ uri: churchAppearance?.logoLight }} style={{ width: "100%", height: DimensionHelper.wp(25) }} contentFit="contain" priority="high" />;
    else return <OptimizedImage source={Constants.Images.logoBlue} style={{ width: "100%", height: DimensionHelper.wp(25) }} contentFit="contain" priority="high" />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surfaceVariant }}>
      <MainHeader title="Checkin" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => handleBack()} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {step === "Services" && <CheckinServices onDone={() => setStep("Household")} handleBack={handleBack} />}
          {step === "Household" && <CheckinHousehold showGroups={handleShowGroups} onDone={() => setStep("Complete")} handleBack={handleBack} />}
          {step === "Groups" && <CheckinGroups member={groupMember!} time={groupTime!} onDone={() => setStep("Household")} handleBack={handleBack} />}
          {step === "Complete" && <CheckinComplete onDone={clearData} handleBack={handleBack} />}
        </View>
      </SafeAreaView>
    </View>
  );
};
export default Service;

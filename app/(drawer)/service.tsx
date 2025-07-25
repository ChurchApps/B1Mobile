import React from "react";
import { CheckinComplete } from "../../src/components/checkin/CheckinComplete";
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

  const getBrand = () => {
    if (churchAppearance?.logoLight) return <OptimizedImage source={{ uri: churchAppearance?.logoLight }} style={{ width: "100%", height: DimensionHelper.wp(25) }} contentFit="contain" priority="high" />;
    else return <OptimizedImage source={Constants.Images.logoBlue} style={{ width: "100%", height: DimensionHelper.wp(25) }} contentFit="contain" priority="high" />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surfaceVariant }}>
      <MainHeader title="Checkin" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => navigateBack()} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {step === "Services" && <CheckinServices onDone={() => setStep("Household")} />}
          {step === "Household" && <CheckinHousehold showGroups={handleShowGroups} onDone={() => setStep("Complete")} />}
          {step === "Groups" && <CheckinGroups member={groupMember!} time={groupTime!} onDone={() => setStep("Household")} />}
          {step === "Complete" && <CheckinComplete onDone={clearData} />}
        </View>
      </SafeAreaView>
    </View>
  );
};
export default Service;

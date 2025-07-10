import React from "react";
import { CheckinComplete } from "../../src/components/checkin/CheckinComplete";
import { CheckinGroups } from "../../src/components/checkin/CheckinGroups";
import { CheckinHousehold } from "../../src/components/checkin/CheckinHousehold";
import { CheckinServices } from "../../src/components/checkin/CheckinServices";
import { CheckinHelper, Constants, PersonInterface, ServiceTimeInterface } from "../../src/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { router } from "expo-router";
import { useState } from "react";
import { Image, SafeAreaView, ScrollView, View } from "react-native";
import { useAppTheme } from "../../src/theme";
import { Surface } from "react-native-paper";
import { useChurchAppearance } from "../../src/stores/useUserStore";
import { MainHeader } from "../../src/components/wrapper/MainHeader";

const Service = () => {
  const { theme, spacing } = useAppTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
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
    router.navigate("/(drawer)/dashboard");
  };

  const getBrand = () => {
    if (churchAppearance?.logoLight) return <Image source={{ uri: churchAppearance?.logoLight }} style={{ width: "100%", height: DimensionHelper.wp(25) }} />;
    else return <Image source={Constants.Images.logoBlue} style={{ width: "100%", height: DimensionHelper.wp(25) }} />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surfaceVariant }}>
      <MainHeader title="Checkin" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => router.navigate("/(drawer)/dashboard")} />
      <ScrollView>
        <SafeAreaView style={{ flex: 1 }}>
          {getBrand()}
          <Surface style={{ margin: spacing.md, padding: spacing.lg, borderRadius: theme.roundness, backgroundColor: theme.colors.surface }}>
            {step === "Services" && <CheckinServices onDone={() => setStep("Household")} />}
            {step === "Household" && <CheckinHousehold showGroups={handleShowGroups} onDone={() => setStep("Complete")} />}
            {step === "Groups" && <CheckinGroups member={groupMember!} time={groupTime!} onDone={() => setStep("Household")} />}
            {step === "Complete" && <CheckinComplete onDone={clearData} />}
          </Surface>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
};
export default Service;

import React from 'react';
import { CheckinComplete } from "@/src/components/checkin/CheckinComplete";
import { CheckinGroups } from "@/src/components/checkin/CheckinGroups";
import { CheckinHousehold } from "@/src/components/checkin/CheckinHousehold";
import { CheckinServices } from "@/src/components/checkin/CheckinServices";
import { MainHeader } from "@/src/components/wrapper/MainHeader";
import { CheckinHelper, Constants, PersonInterface, ServiceTimeInterface, UserHelper, globalStyles } from "@/src/helpers";
import { NavigationProps } from "@/src/interfaces"; // Unused
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native"; // useNavigation from @react-navigation/native, not expo-router for Drawer
import { router } from "expo-router";
import { useState } from "react";
import { Image, SafeAreaView, StyleSheet, View } from "react-native"; // Added View, StyleSheet
import { useTheme } from 'react-native-paper';

// interface Props { // Unused
//   navigation: NavigationProps;
// }

const Service = () => { // Removed props: Props
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [step, setStep] = useState("Services");
  const [groupMember, setGroupMember] = useState<PersonInterface | undefined>(); // Typed undefined
  const [groupTime, setGroupTime] = useState<ServiceTimeInterface | undefined>(); // Typed undefined

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
    router.navigate('/(drawer)/dashboard');
  };

  const styles = StyleSheet.create({
    outerSafeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    innerContainer: { // Replaces the inner SafeAreaView
      flex: 1,
      // Add padding or other layout styles if needed
    },
    brandImage: {
      width: "100%",
      height: DimensionHelper.wp(25),
      resizeMode: 'contain', // Ensure logo fits well
      marginVertical: theme.spacing?.md || 16, // Add some spacing
    },
    // globalStyles.whiteMainIcon might need review if theme.colors.background is dark
    defaultBrandImage: {
      ...globalStyles.whiteMainIcon, // Spread to keep original dimensions/aspect ratio
      alignSelf: 'center', // Center if it's not full width
      marginVertical: theme.spacing?.md || 16,
    }
  });

  const getBrand = () => {
    if (UserHelper.churchAppearance?.logoLight) {
      return <Image source={{ uri: UserHelper.churchAppearance.logoLight }} style={styles.brandImage} />;
    } else {
      // Ensure Constants.Images.logoBlue is appropriate for the theme background
      return <Image source={Constants.Images.logoBlue} style={styles.defaultBrandImage} />;
    }
  };

  return (
    <SafeAreaView style={styles.outerSafeArea}>
      <MainHeader title="Checkin" openDrawer={navigation.openDrawer} />
      <View style={styles.innerContainer}>
        {getBrand()}
        {step === "Services" && <CheckinServices onDone={() => setStep("Household")} />}
        {step === "Household" && <CheckinHousehold showGroups={handleShowGroups} onDone={() => setStep("Complete")} />}
        {step === "Groups" && <CheckinGroups member={groupMember!} time={groupTime!} onDone={() => setStep("Household")} />}
        {step === "Complete" && <CheckinComplete onDone={clearData} />}
      </View>
    </SafeAreaView>
  );
};
export default Service;

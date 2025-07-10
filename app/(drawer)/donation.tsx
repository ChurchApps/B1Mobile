import React from "react";
import { DonationForm } from "../../src/components/donations/DonationForm";
import { Donations } from "../../src/components/donations/Donations";
import { PaymentMethods } from "../../src/components/donations/PaymentMethods";
import { RecurringDonations } from "../../src/components/donations/RecurringDonations";
import { CacheHelper, UserHelper } from "../../src/helpers";
import { ErrorHelper } from "../../src/mobilehelper";
import { StripePaymentMethod } from "../../src/interfaces";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useIsFocused, useNavigation, DrawerActions } from "@react-navigation/native";
import { initStripe } from "@stripe/stripe-react-native";
import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Provider as PaperProvider, Text, MD3LightTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useAppTheme } from "../../src/theme";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { router } from "expo-router";
import { useCurrentUserChurch } from "../../src/stores/useUserStore";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#175ec1",
    secondary: "#f0f2f5",
    surface: "#ffffff",
    background: "#f8f9fa",
    elevation: {
      level0: "transparent",
      level1: "#ffffff",
      level2: "#f8f9fa",
      level3: "#f0f2f5",
      level4: "#e9ecef",
      level5: "#e2e6ea"
    }
  }
};

const Donation = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { spacing } = useAppTheme();
  const [customerId, setCustomerId] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<StripePaymentMethod[]>([]);
  const [publishKey, setPublishKey] = useState<string>("");
  const isFocused = useIsFocused();
  const currentUserChurch = useCurrentUserChurch();
  const person = currentUserChurch?.person;

  // Use react-query for gateway data
  const {
    data: gatewayData,
    isLoading: gatewayLoading,
    refetch: refetchGateway
  } = useQuery({
    queryKey: ["/gateways/churchId/" + CacheHelper.church?.id, "GivingApi"],
    enabled: !!CacheHelper.church?.id && isFocused,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes - gateway config rarely changes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Use react-query for payment methods
  const {
    data: paymentMethodsData,
    isLoading: paymentMethodsLoading,
    refetch: refetchPaymentMethods
  } = useQuery({
    queryKey: ["/paymentmethods/personid/" + person?.id, "GivingApi"],
    enabled: !!person?.id && !!publishKey && isFocused,
    placeholderData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  const areMethodsLoading = gatewayLoading || paymentMethodsLoading;

  useEffect(() => {
    UserHelper.addOpenScreenEvent("Donation Screen");
  }, []);

  useEffect(() => {
    if (gatewayData && gatewayData.length && gatewayData[0]?.publicKey) {
      initStripe({ publishableKey: gatewayData[0].publicKey });
      setPublishKey(gatewayData[0].publicKey);
    }
  }, [gatewayData]);

  useEffect(() => {
    if (paymentMethodsData) {
      if (!paymentMethodsData.length) {
        setPaymentMethods([]);
        setCustomerId("");
      } else {
        const cards = paymentMethodsData[0].cards.data.map((card: any) => new StripePaymentMethod(card));
        const banks = paymentMethodsData[0].banks.data.map((bank: any) => new StripePaymentMethod(bank));
        const methods = cards.concat(banks);
        setCustomerId(paymentMethodsData[0].customer.id);
        setPaymentMethods(methods);
      }
    }
  }, [paymentMethodsData]);

  const loadData = async () => {
    try {
      await Promise.all([refetchGateway(), refetchPaymentMethods()]);
    } catch (err: any) {
      Alert.alert("Failed to fetch payment methods", err.message);
      ErrorHelper.logError("load-donations", err);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
        <LoadingWrapper loading={areMethodsLoading}>
          <View style={{ flex: 1 }}>
            <MainHeader title="Donate" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => router.navigate("/(drawer)/dashboard")} />
            <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: spacing.md }}>
              {currentUserChurch?.person?.id && <PaymentMethods customerId={customerId} paymentMethods={paymentMethods} updatedFunction={loadData} isLoading={areMethodsLoading} publishKey={publishKey} />}
              <DonationForm paymentMethods={paymentMethods} customerId={customerId} updatedFunction={loadData} />
              {!currentUserChurch?.person?.id ? (
                <Text variant="bodyMedium" style={{ marginVertical: spacing.md, color: theme.colors.onSurface }}>
                  Please login to view existing donations
                </Text>
              ) : (
                <>
                  <RecurringDonations customerId={customerId} paymentMethods={paymentMethods} updatedFunction={loadData} />
                  <Donations />
                </>
              )}
            </ScrollView>
          </View>
        </LoadingWrapper>
      </SafeAreaView>
    </PaperProvider>
  );
};

export default Donation;

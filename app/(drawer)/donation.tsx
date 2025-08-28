import React from "react";
import {
  EnhancedDonationForm,
  EnhancedGivingHistory
} from "../../src/components/donations/LazyDonationComponents";
import { GivingOverview, DonationTabBar, ManagePayments } from "../../src/components/donations/sections/exports";
import { UserHelper } from "@/helpers/UserHelper";
import { ErrorHelper } from "../../src/mobilehelper";
import { StripePaymentMethod } from "../../src/interfaces";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useIsFocused, useNavigation as useReactNavigation, DrawerActions } from "@react-navigation/native";
import { initStripe } from "@stripe/stripe-react-native";
import { useEffect, useState, useMemo } from "react";
import { Alert, ScrollView, View, StyleSheet } from "react-native";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useDonationFunds } from "../../src/hooks/useStaleWhileRevalidate";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { useNavigation } from "../../src/hooks";
import { useCurrentUserChurch } from "../../src/stores/useUserStore";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#0D47A1",
    secondary: "#f0f2f5",
    surface: "#ffffff",
    background: "#F6F6F8",
    onSurface: "#3c3c3c",
    onBackground: "#3c3c3c",
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
  const navigation = useReactNavigation<DrawerNavigationProp<any>>();
  const { navigateBack } = useNavigation();
  const [customerId, setCustomerId] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<StripePaymentMethod[]>([]);
  const [publishKey, setPublishKey] = useState<string>("");
  const [activeSection, setActiveSection] = useState<"overview" | "donate" | "manage" | "history">("overview");
  const isFocused = useIsFocused();
  const currentUserChurch = useCurrentUserChurch();
  const person = currentUserChurch?.person;

  // Example of stale-while-revalidate for donation funds
  const {
    data: fundsData,
    showSkeleton: showFundsSkeleton,
    isRevalidating: fundsRevalidating
  } = useDonationFunds(currentUserChurch?.church?.id || '');

  // Use react-query for gateway data
  const {
    data: gatewayData,
    isLoading: gatewayLoading,
    refetch: refetchGateway
  } = useQuery({
    queryKey: ["/gateways/churchId/" + currentUserChurch?.church?.id, "GivingApi"],
    enabled: !!currentUserChurch?.church?.id && isFocused,
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

  // Sample data for demonstration - in real app this would come from API
  const givingStats = useMemo(
    () => ({
      ytd: 2850.0,
      lastGift: 125.0,
      totalGifts: 12,
      lastGiftDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
    }),
    []
  );

  const renderOverviewSection = () => (
    <GivingOverview
      givingStats={givingStats}
      onDonatePress={() => setActiveSection("donate")}
      onHistoryPress={() => setActiveSection("history")}
    />
  );

  const renderDonateSection = () => <EnhancedDonationForm paymentMethods={paymentMethods} customerId={customerId} updatedFunction={loadData} />;

  const renderManageSection = () => (
    <ManagePayments
      person={person}
      customerId={customerId}
      paymentMethods={paymentMethods}
      isLoading={areMethodsLoading}
      publishKey={publishKey}
      loadData={loadData}
    />
  );

  const renderHistorySection = () => <EnhancedGivingHistory customerId={customerId} />;

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <View style={styles.content}>
          <MainHeader title="Giving" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => navigateBack()} />

          <DonationTabBar activeSection={activeSection} onTabChange={setActiveSection} />

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {activeSection === "overview" && renderOverviewSection()}
            {activeSection === "donate" && renderDonateSection()}
            {activeSection === "manage" && renderManageSection()}
            {activeSection === "history" && renderHistorySection()}
          </ScrollView>
        </View>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  content: {
    flex: 1
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32
  }
});

export default Donation;

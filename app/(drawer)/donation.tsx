import React from "react";
import { EnhancedDonationForm, EnhancedGivingHistory } from "../../src/components/donations/LazyDonationComponents";
import { GivingOverview, DonationTabBar, ManagePayments } from "../../src/components/donations/sections/exports";
import { UserHelper } from "@/helpers/UserHelper";
import { ErrorHelper } from "../../src/mobilehelper";
import { DonationImpact, GatewayData, PaymentMethodsResponse, StripePaymentMethod } from "../../src/interfaces";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useIsFocused, useNavigation as useReactNavigation, DrawerActions } from "@react-navigation/native";
import { initStripe } from "@stripe/stripe-react-native";
import { useEffect, useState, useMemo } from "react";
import { Alert, ScrollView, View, StyleSheet } from "react-native";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { useDonationFunds } from "../../src/hooks/useStaleWhileRevalidate";
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
  const [selectedRepeatDonation, setSelectedRepeatDonation] = useState<{ amount: string; fundId?: string; } | null>(null);

  // Example of stale-while-revalidate for donation funds
  const { data: fundsData, showSkeleton: showFundsSkeleton, isRevalidating: fundsRevalidating } = useDonationFunds(currentUserChurch?.church?.id || "");

  // Use react-query for gateway data
  const {
    data: gatewayData,
    isLoading: gatewayLoading,
    refetch: refetchGateway
  } = useQuery<GatewayData[]>({
    queryKey: ["/gateways/churchId/" + currentUserChurch?.church?.id, "GivingApi"],
    enabled: !!currentUserChurch?.church?.id && isFocused,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes - gateway config rarely changes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Get customer ID first (like AppHelper with fallback)
  const {
    data: customerData,
    isLoading: customerLoading,
  } = useQuery<any>({
    queryKey: ["/customers?personId=" + person?.id, "GivingApi"],
    enabled: !!person?.id && isFocused,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

  // Use react-query for payment methods (using personId endpoint that works)
  const {
    data: paymentMethodsData,
    isLoading: paymentMethodsLoading,
    refetch: refetchPaymentMethods
  } = useQuery<StripePaymentMethod[]>({
    queryKey: ["/paymentmethods/personid/" + person?.id, "GivingApi"],
    enabled: !!person?.id && !!publishKey && isFocused,
    placeholderData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  const {
    data: donationImpactData = [],
    isLoading: donationImpactLoading,
    refetch: refetchDonation
  } = useQuery<DonationImpact[]>({
    queryKey: ["/donations/my", "GivingApi"],
    enabled: isFocused,
    placeholderData: [],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  const areMethodsLoading = gatewayLoading || customerLoading || paymentMethodsLoading || donationImpactLoading;

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
    console.log("💳 Payment Methods Debug:", {
      paymentMethodsData,
      customerData,
      person: person?.id
    });

    if (paymentMethodsData && Array.isArray(paymentMethodsData) && paymentMethodsData.length > 0) {
      // Handle direct array format from API
      const methods = paymentMethodsData.map((item: any) => new StripePaymentMethod(item));

      // Set customerId from first payment method (most reliable)
      setCustomerId(paymentMethodsData[0]?.customerId || "");
      setPaymentMethods(methods);
    } else if (customerData && (!paymentMethodsData || paymentMethodsData.length === 0)) {
      // Fallback: use customer data if no payment methods data
      const cust = Array.isArray(customerData) ? customerData[0] : customerData;
      const cid = cust?.id || cust?.customerId || '';
      setCustomerId(cid);
      setPaymentMethods([]); // No payment methods available
    }
  }, [paymentMethodsData, customerData]);

  const loadData = async () => {
    try {
      await Promise.all([refetchGateway(), refetchPaymentMethods(), refetchDonation()]);
    } catch (err: any) {
      Alert.alert("Failed to fetch payment methods", err.message);
      ErrorHelper.logError("load-donations", err);
    }
  };

  const givingStats = useMemo(() => {
    const all = (donationImpactData ?? []).slice();
    all.sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime());

    const nowYear = new Date().getFullYear();
    const ytdItems = all.filter((d) => new Date(d.donationDate).getFullYear() === nowYear);

    const ytd = ytdItems.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalGifts = ytdItems.length;

    const lastGiftDonation = all[0];
    const lastGift = lastGiftDonation?.amount ?? 0;
    const lastGiftDate = lastGiftDonation ? new Date(lastGiftDonation.donationDate) : null;

    return { ytd, totalGifts, lastGift, lastGiftDate };
  }, [donationImpactData]);

  const handleRepeatDonation = () => {
    if (!givingStats.lastGift) return;

    const repeatDonation: { amount: string; fundId?: string } = {
      amount: String(donationImpactData[0]?.amount),
      fundId: donationImpactData[0]?.fund?.id,
    }
    setSelectedRepeatDonation(repeatDonation);

    setActiveSection('donate');
  };

  const renderOverviewSection = () => <GivingOverview givingStats={givingStats} onDonatePress={handleRepeatDonation} onHistoryPress={() => setActiveSection("history")} />;

  const renderDonateSection = () => <EnhancedDonationForm paymentMethods={paymentMethods} customerId={customerId} gatewayData={gatewayData} updatedFunction={loadData} initialDonation={selectedRepeatDonation} />;

  const renderManageSection = () => <ManagePayments person={person} customerId={customerId} paymentMethods={paymentMethods} isLoading={areMethodsLoading} publishKey={publishKey} loadData={loadData} />;

  const renderHistorySection = () => <EnhancedGivingHistory customerId={customerId} paymentMethods={paymentMethods || []} donationImpactData={donationImpactData || []} donationImpactLoading={donationImpactLoading} />;

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

import React from "react";
import { 
  EnhancedDonationForm, 
  EnhancedGivingHistory, 
  PaymentMethods 
} from "../../src/components/donations/LazyDonationComponents";
import { UserHelper } from "@/helpers/UserHelper";
import { CurrencyHelper } from "@/helpers/CurrencyHelper";
import { ErrorHelper } from "../../src/mobilehelper";
import { StripePaymentMethod } from "../../src/interfaces";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useIsFocused, useNavigation as useReactNavigation, DrawerActions } from "@react-navigation/native";
import { initStripe } from "@stripe/stripe-react-native";
import { useEffect, useState, useMemo } from "react";
import { Alert, ScrollView, View, StyleSheet, TouchableOpacity } from "react-native";
import { Provider as PaperProvider, Text, MD3LightTheme, Card, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useDonationFunds } from "../../src/hooks/useStaleWhileRevalidate";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { useNavigation } from "../../src/hooks";
import { useCurrentUserChurch } from "../../src/stores/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
    <>
      {/* Hero Stats Card */}
      <Card style={styles.heroCard}>
        <LinearGradient colors={["#0D47A1", "#2196F3"]} style={styles.heroGradient}>
          <View style={styles.heroContent}>
            <Text variant="headlineSmall" style={styles.heroTitle}>
              Your Giving Impact
            </Text>
            <Text variant="displaySmall" style={styles.heroAmount}>
              {CurrencyHelper.formatCurrency(givingStats.ytd)}
            </Text>
            <Text variant="bodyMedium" style={styles.heroSubtitle}>
              Total this year • {givingStats.totalGifts} gifts
            </Text>
          </View>
        </LinearGradient>
      </Card>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recent Activity
          </Text>
          <Button mode="text" onPress={() => setActiveSection("history")} labelStyle={{ color: "#0D47A1" }}>
            View All
          </Button>
        </View>

        <Card style={styles.activityCard}>
          <Card.Content style={styles.activityContent}>
            <View style={styles.activityIcon}>
              <MaterialIcons name="favorite" size={24} color="#70DC87" />
            </View>
            <View style={styles.activityDetails}>
              <Text variant="titleMedium" style={styles.activityTitle}>
                Last Gift
              </Text>
              <Text variant="bodyMedium" style={styles.activityAmount}>
                {CurrencyHelper.formatCurrency(givingStats.lastGift)}
              </Text>
              <Text variant="bodySmall" style={styles.activityDate}>
                {givingStats.lastGiftDate.toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity style={styles.repeatButton} onPress={() => setActiveSection("donate")}>
              <Text variant="labelMedium" style={styles.repeatButtonText}>
                Repeat
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>

      {/* CTA Section */}
      <Card style={styles.ctaCard}>
        <Card.Content style={styles.ctaContent}>
          <MaterialIcons name="volunteer-activism" size={48} color="#0D47A1" style={styles.ctaIcon} />
          <Text variant="titleLarge" style={styles.ctaTitle}>
            Make a Difference Today
          </Text>
          <Text variant="bodyMedium" style={styles.ctaSubtitle}>
            Your generosity helps our church community thrive and grow.
          </Text>
          <Button mode="contained" onPress={() => setActiveSection("donate")} style={styles.ctaButton} labelStyle={styles.ctaButtonText}>
            Give Now
          </Button>
        </Card.Content>
      </Card>
    </>
  );

  const renderDonateSection = () => <EnhancedDonationForm paymentMethods={paymentMethods} customerId={customerId} updatedFunction={loadData} />;

  const renderManageSection = () => (
    <>
      {!currentUserChurch?.person?.id ? (
        <Card style={styles.loginPromptCard}>
          <Card.Content style={styles.loginPromptContent}>
            <MaterialIcons name="login" size={48} color="#9E9E9E" style={styles.loginPromptIcon} />
            <Text variant="titleMedium" style={styles.loginPromptTitle}>
              Please login to manage payment methods
            </Text>
            <Text variant="bodyMedium" style={styles.loginPromptSubtitle}>
              Save your payment information for faster, more convenient giving.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <PaymentMethods customerId={customerId} paymentMethods={paymentMethods} updatedFunction={loadData} isLoading={areMethodsLoading} publishKey={publishKey} />
      )}
    </>
  );

  const renderHistorySection = () => <EnhancedGivingHistory customerId={customerId} />;

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <LoadingWrapper loading={areMethodsLoading}>
          <View style={styles.content}>
            <MainHeader title="Giving" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => navigateBack()} />

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity style={[styles.tab, activeSection === "overview" && styles.activeTab]} onPress={() => setActiveSection("overview")}>
                <Text variant="labelLarge" style={[styles.tabText, activeSection === "overview" && styles.activeTabText]}>
                  Overview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, activeSection === "donate" && styles.activeTab]} onPress={() => setActiveSection("donate")}>
                <Text variant="labelLarge" style={[styles.tabText, activeSection === "donate" && styles.activeTabText]}>
                  Give
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, activeSection === "manage" && styles.activeTab]} onPress={() => setActiveSection("manage")}>
                <Text variant="labelLarge" style={[styles.tabText, activeSection === "manage" && styles.activeTabText]}>
                  Manage
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, activeSection === "history" && styles.activeTab]} onPress={() => setActiveSection("history")}>
                <Text variant="labelLarge" style={[styles.tabText, activeSection === "history" && styles.activeTabText]}>
                  History
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {activeSection === "overview" && renderOverviewSection()}
              {activeSection === "donate" && renderDonateSection()}
              {activeSection === "manage" && renderManageSection()}
              {activeSection === "history" && renderHistorySection()}
            </ScrollView>
          </View>
        </LoadingWrapper>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8" // Background from style guide
  },
  content: {
    flex: 1
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  activeTab: {
    borderBottomColor: "#0D47A1"
  },
  tabText: {
    color: "#9E9E9E",
    fontWeight: "500"
  },
  activeTabText: {
    color: "#0D47A1",
    fontWeight: "700"
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32
  },

  // Hero Card Styles
  heroCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  heroGradient: {
    padding: 24,
    minHeight: 160
  },
  heroContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  heroTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center"
  },
  heroAmount: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginBottom: 8
  },
  heroSubtitle: {
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center"
  },

  // Section Styles
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  sectionTitle: {
    color: "#3c3c3c",
    fontWeight: "700",
    fontSize: 20
  },

  // Activity Card
  activityCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  activityContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F6F6F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  activityDetails: {
    flex: 1
  },
  activityTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 2
  },
  activityAmount: {
    color: "#0D47A1",
    fontWeight: "700",
    marginBottom: 2
  },
  activityDate: {
    color: "#9E9E9E"
  },
  repeatButton: {
    backgroundColor: "rgba(21, 101, 192, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  repeatButtonText: {
    color: "#0D47A1",
    fontWeight: "600"
  },

  // CTA Card
  ctaCard: {
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(21, 101, 192, 0.1)"
  },
  ctaContent: {
    alignItems: "center",
    padding: 24
  },
  ctaIcon: {
    marginBottom: 16
  },
  ctaTitle: {
    color: "#3c3c3c",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  ctaSubtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16
  },
  ctaButton: {
    backgroundColor: "#0D47A1",
    borderRadius: 12,
    paddingHorizontal: 32,
    elevation: 3,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16
  },

  // Login Prompt
  loginPromptCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  loginPromptContent: {
    alignItems: "center",
    padding: 32
  },
  loginPromptIcon: {
    marginBottom: 16
  },
  loginPromptTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8
  },
  loginPromptSubtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  }
});

export default Donation;

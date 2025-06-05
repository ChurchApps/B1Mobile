import React from "react";
import { DonationForm } from "@/src/components/donations/DonationForm";
import { Donations } from "@/src/components/donations/Donations";
import { PaymentMethods } from "@/src/components/donations/PaymentMethods";
import { RecurringDonations } from "@/src/components/donations/RecurringDonations";
import { ApiHelper, CacheHelper, UserHelper } from "@/src/helpers";
import { ErrorHelper } from "@/src/helpers/ErrorHelper";
import { StripePaymentMethod } from "@/src/interfaces";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useIsFocused } from "@react-navigation/native";
import { initStripe } from "@stripe/stripe-react-native";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Provider as PaperProvider, Appbar, Text, MD3LightTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/src/theme";
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";

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
  const [areMethodsLoading, setAreMethodsLoading] = useState<boolean>(false);
  const [publishKey, setPublishKey] = useState<string>("");
  const isFocused = useIsFocused();
  const person = UserHelper.currentUserChurch?.person;

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused]);

  useEffect(() => {
    UserHelper.addOpenScreenEvent("Donation Screen");
  }, []);

  const loadData = async () => {
    try {
      setAreMethodsLoading(true);
      const data = await ApiHelper.get("/gateways/churchId/" + CacheHelper.church!.id, "GivingApi");
      if (data.length && data[0]?.publicKey) {
        initStripe({ publishableKey: data[0].publicKey });
        setPublishKey(data[0].publicKey);
        const results = await ApiHelper.get("/paymentmethods/personid/" + person.id, "GivingApi");
        if (!results.length) setPaymentMethods([]);
        else {
          let cards = results[0].cards.data.map((card: any) => new StripePaymentMethod(card));
          let banks = results[0].banks.data.map((bank: any) => new StripePaymentMethod(bank));
          let methods = cards.concat(banks);
          setCustomerId(results[0].customer.id);
          setPaymentMethods(methods);
        }
      } else setPaymentMethods([]);
      setAreMethodsLoading(false);
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
            <Appbar.Header
              style={{ backgroundColor: theme.colors.primary, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 }}
              mode="center-aligned">
              <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} color="white" />
              <Appbar.Content title="Donate" titleStyle={{ color: "white", fontSize: 20, fontWeight: "600" }} />
              <Appbar.Action icon="arrow-left" onPress={() => navigation.goBack()} color="white" />
            </Appbar.Header>
            <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: spacing.md }}>
              {UserHelper.currentUserChurch?.person?.id && (
                <PaymentMethods customerId={customerId} paymentMethods={paymentMethods} updatedFunction={loadData} isLoading={areMethodsLoading} publishKey={publishKey} />
              )}
              <DonationForm paymentMethods={paymentMethods} customerId={customerId} updatedFunction={loadData} />
              {!UserHelper.currentUserChurch?.person?.id ? (
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

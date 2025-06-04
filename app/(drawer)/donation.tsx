import React from 'react';
import { DonationForm } from '@/src/components/donations/DonationForm';
import { Donations } from '@/src/components/donations/Donations';
import { PaymentMethods } from '@/src/components/donations/PaymentMethods';
import { RecurringDonations } from '@/src/components/donations/RecurringDonations';
import { MainHeader } from '@/src/components/wrapper/MainHeader';
import { ApiHelper, CacheHelper, UserHelper, globalStyles } from '@/src/helpers';
import { ErrorHelper } from '@/src/helpers/ErrorHelper';
import { NavigationProps, StripePaymentMethod } from '@/src/interfaces'; // Removed DimensionHelper as it's directly used less here
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useIsFocused } from '@react-navigation/native';
import { initStripe } from "@stripe/stripe-react-native";
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, View, StyleSheet } from 'react-native'; // Text removed
import { ScrollView } from 'react-native-gesture-handler';
import { Text as PaperText, useTheme } from 'react-native-paper';
import { DimensionHelper } from '@/src/helpers/DimensionHelper'; // Keep for specific DimensionHelper.wp uses

const Donation = (props: Props) => { // Props interface seems to be unused in this component directly.
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [customerId, setCustomerId] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<StripePaymentMethod[]>([]);
  const [areMethodsLoading, setAreMethodsLoading] = useState<boolean>(false);
  const [publishKey, setPublishKey] = useState<string>("");
  const isFocused = useIsFocused();
  const person = UserHelper.currentUserChurch?.person;

  useEffect(() => { if (isFocused) loadData(); }, [isFocused]);

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
        if (person?.id) { // Ensure person.id exists before fetching payment methods
          const results = await ApiHelper.get("/paymentmethods/personid/" + person.id, "GivingApi");
          if (!results || !results.length) setPaymentMethods([]); // Check for null/empty results
          else {
            let cards = results[0].cards?.data.map((card: any) => new StripePaymentMethod(card)) || [];
            let banks = results[0].banks?.data.map((bank: any) => new StripePaymentMethod(bank)) || [];
            let methods = cards.concat(banks);
            setCustomerId(results[0].customer?.id || ""); // Handle missing customer id
            setPaymentMethods(methods);
          }
        } else {
           setPaymentMethods([]); // No person, so no payment methods to fetch
        }
      } else {
        setPaymentMethods([]);
      }
    } catch (err: any) {
      Alert.alert("Failed to fetch payment methods", err.message);
      ErrorHelper.logError("load-donations", err);
    } finally {
      setAreMethodsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1, // Make SafeAreaView take full screen
      backgroundColor: theme.colors.background, // Use theme background
    },
    scrollView: {
      // backgroundColor: theme.colors.background, // Can be set here or on SafeAreaView
    },
    loginMessage: {
      // from globalStyles.paymentDetailText
      ...globalStyles.paymentDetailText, // Spread to keep original font size, etc.
      color: theme.colors.onSurfaceVariant, // Use a theme color
      marginVertical: DimensionHelper.wp(2),
      textAlign: 'center',
      paddingHorizontal: theme.spacing?.md || 16,
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <MainHeader title="Donate" openDrawer={navigation.openDrawer} />
      <ScrollView style={styles.scrollView}>
        {UserHelper.currentUserChurch?.person?.id ? (
          <PaymentMethods customerId={customerId} paymentMethods={paymentMethods} updatedFunction={loadData} isLoading={areMethodsLoading} publishKey={publishKey} />
        ) : null}
        <DonationForm paymentMethods={paymentMethods} customerId={customerId} updatedFunction={loadData} />
        {!UserHelper.currentUserChurch?.person?.id ? (
          <PaperText style={styles.loginMessage}>
            Please login to view existing donations
          </PaperText>
        ) : (
          <View>
            <RecurringDonations customerId={customerId} paymentMethods={paymentMethods} updatedFunction={loadData} />
            <Donations />
          </View>
        )}
      </ScrollView>
    </SafeAreaView >
  );
};

export default Donation;

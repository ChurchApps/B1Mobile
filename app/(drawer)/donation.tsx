import { DonationForm } from '@/src/components/donations/DonationForm';
import { Donations } from '@/src/components/donations/Donations';
import { PaymentMethods } from '@/src/components/donations/PaymentMethods';
import { RecurringDonations } from '@/src/components/donations/RecurringDonations';
import { MainHeader } from '@/src/components/wrapper/MainHeader';
import { ApiHelper, CacheHelper, UserHelper, globalStyles } from '@/src/helpers';
import { ErrorHelper } from '@/src/helpers/ErrorHelper';
import { NavigationProps, StripePaymentMethod } from '@/src/interfaces';
import { DimensionHelper } from '@churchapps/mobilehelper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useIsFocused } from '@react-navigation/native';
import { initStripe } from "@stripe/stripe-react-native";
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

interface Props {
  navigation: NavigationProps;
}

const Donation = (props: Props) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [customerId, setCustomerId] = useState<string>("")
  const [paymentMethods, setPaymentMethods] = useState<StripePaymentMethod[]>([])
  const [areMethodsLoading, setAreMethodsLoading] = useState<boolean>(false)
  const [publishKey, setPublishKey] = useState<string>("")
  const isFocused = useIsFocused();
  const person = UserHelper.currentUserChurch?.person

  useEffect(() => { if (isFocused) loadData() }, [isFocused])

  // initialise stripe
  const loadData = async () => {
    // Utilities.trackEvent("Donation Screen");
    try {
      setAreMethodsLoading(true)
      const data = await ApiHelper.get("/gateways/churchId/" + CacheHelper.church!.id, "GivingApi")
      if (data.length && data[0]?.publicKey) {
        initStripe({ publishableKey: data[0].publicKey })
        setPublishKey(data[0].publicKey)
        const results = await ApiHelper.get("/paymentmethods/personid/" + person.id, "GivingApi")
        if (!results.length) setPaymentMethods([])
        else {
          let cards = results[0].cards.data.map((card: any) => new StripePaymentMethod(card));
          let banks = results[0].banks.data.map((bank: any) => new StripePaymentMethod(bank));
          let methods = cards.concat(banks);
          setCustomerId(results[0].customer.id);
          setPaymentMethods(methods);
        }
      } else setPaymentMethods([])
      setAreMethodsLoading(false)
    } catch (err: any) {
      Alert.alert("Failed to fetch payment methods", err.message)
      ErrorHelper.logError("load-donations", err);
    }

  }

  return (
    <SafeAreaView style={globalStyles.grayContainer}>
      <MainHeader title="Donate" openDrawer={navigation.openDrawer} back={navigation.goBack} />
      <ScrollView>
        {UserHelper.currentUserChurch?.person?.id ?
          <PaymentMethods customerId={customerId} paymentMethods={paymentMethods} updatedFunction={loadData} isLoading={areMethodsLoading} publishKey={publishKey} />
          : null
        }
        <DonationForm paymentMethods={paymentMethods} customerId={customerId} updatedFunction={loadData} />
        {!UserHelper.currentUserChurch?.person?.id
          ? <Text style={[globalStyles.paymentDetailText, { marginVertical: DimensionHelper.wp('2%'), }]}>Please login to view existing donations</Text>
          : <View>
            <RecurringDonations customerId={customerId} paymentMethods={paymentMethods} updatedFunction={loadData} />
            <Donations />
          </View>}
      </ScrollView>
    </SafeAreaView >
  );
};

export default Donation;

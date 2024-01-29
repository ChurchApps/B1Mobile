import { AppCenterHelper, DimensionHelper } from '@churchapps/mobilehelper';
import { useIsFocused } from '@react-navigation/native';
import { initStripe } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { DonationForm, Donations, MainHeader, PaymentMethods, RecurringDonations } from '../components';
import { ApiHelper, CacheHelper, UserHelper, globalStyles } from '../helpers';
import { ErrorHelper } from '../helpers/ErrorHelper';
import { NavigationProps, StripePaymentMethod } from '../interfaces';
;

interface Props {
  navigation: NavigationProps;
}

const DonationScreen = (props: Props) => {
  const [customerId, setCustomerId] = useState<string>("")
  const [paymentMethods, setPaymentMethods] = useState<StripePaymentMethod[]>([])
  const [areMethodsLoading, setAreMethodsLoading] = useState<boolean>(false)
  const [publishKey, setPublishKey] = useState<string>("")
  const isFocused = useIsFocused();
  const person = UserHelper.currentUserChurch?.person

  useEffect(() => { if (isFocused) loadData() }, [isFocused])

  // initialise stripe
  const loadData = async () => {
    AppCenterHelper.trackEvent("Donation Screen");
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
      <MainHeader title="Donate" openDrawer={props.navigation.openDrawer} />
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

export default DonationScreen;
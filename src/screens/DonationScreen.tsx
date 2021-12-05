import React, { useState, useEffect } from 'react';
import { SafeAreaView, Image, Text, TouchableOpacity, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Constants } from '../helpers';
import { globalStyles, UserHelper, ApiHelper } from '../helpers';;
import { MainHeader, PaymentMethods, Donations, DonationForm, RecurringDonations } from '../components';
import { initStripe } from "@stripe/stripe-react-native"
import { StripePaymentMethod } from '../interfaces';
import { useIsFocused } from '@react-navigation/native';

interface Props {
  navigation: {
    navigate: (screenName: string) => void;
    goBack: () => void;
    openDrawer: () => void;
  };
}

const DonationScreen = (props: Props) => {
  const { openDrawer } = props.navigation;
  const [customerId, setCustomerId] = useState<string>("")
  const [paymentMethods, setPaymentMethods] = useState<StripePaymentMethod[]>([])
  const [areMethodsLoading, setAreMethodsLoading] = useState<boolean>(false)
  const [publishKey, setPublishKey] = useState<string>("")
  const isFocused = useIsFocused();
  const person = UserHelper.person

  useEffect(() => { if (isFocused) loadData() }, [isFocused])

  // initialise stripe
  const loadData = async () => {
    try {
      setAreMethodsLoading(true)
      const data = await ApiHelper.get("/gateways", "GivingApi")
      if (data.length && data[0]?.publicKey) {
        initStripe({
          publishableKey: data[0].publicKey
        })
        setPublishKey(data[0].publicKey)
        const results = await ApiHelper.get("/paymentmethods/personid/" + person.id, "GivingApi")
        if (!results.length) {
          setPaymentMethods([])
        }
        else {
          let cards = results[0].cards.data.map((card: any) => new StripePaymentMethod(card));
          let banks = results[0].banks.data.map((bank: any) => new StripePaymentMethod(bank));
          let methods = cards.concat(banks);
          setCustomerId(results[0].customer.id);
          setPaymentMethods(methods);
        }
      } else {
        setPaymentMethods([])
      }
      setAreMethodsLoading(false)
    } catch (err: any) {
      Alert.alert("Failed to fetch payment methods", err.message)
    }

  }

  return (
    <SafeAreaView style={globalStyles.grayContainer}>
      <MainHeader
        leftComponent={<TouchableOpacity onPress={() => openDrawer()}>
          <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
        </TouchableOpacity>}
        mainComponent={<Text style={globalStyles.headerText}>Donate</Text>}
        rightComponent={null}
      />
      <ScrollView>
        <PaymentMethods
          customerId={customerId}
          paymentMethods={paymentMethods}
          updatedFunction={loadData}
          isLoading={areMethodsLoading}
          publishKey={publishKey}
        />
        <DonationForm
          paymentMethods={paymentMethods}
          customerId={customerId}
          updatedFunction={loadData}
        />
        <RecurringDonations
          customerId={customerId}
          paymentMethods={paymentMethods}
          updatedFunction={loadData}
        />
        <Donations />
      </ScrollView>
    </SafeAreaView >
  );
};

export default DonationScreen;
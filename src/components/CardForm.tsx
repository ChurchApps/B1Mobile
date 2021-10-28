import React, { useState } from "react";
import { View, Image, Alert, TextInput, Text } from "react-native";
import { CardField, CardFieldInput, useStripe } from "@stripe/stripe-react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { InputBox } from ".";
import Images from "../utils/Images";
import { globalStyles, Userhelper, ApiHelper } from "../helper";
import { StripePaymentMethod, PaymentMethodInterface } from "../interfaces";

interface Props {
  setMode: any;
  card: StripePaymentMethod;
  customerId: string;
  updatedFunction: () => void;
}

export function CardForm({ setMode, card, customerId, updatedFunction }: Props) {
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [month, setMonth] = React.useState<string>("");
  const [year, setYear] = React.useState<string>("");
  const { createPaymentMethod } = useStripe();
  const person = Userhelper.person;

  const handleSave = () => {
    setIsSubmitting(true);
    return card.id ? updateCard() : createCard();
  };

  const createCard = async () => {
    const stripePaymentMethod = await createPaymentMethod({
      type: "Card",
      ...cardDetails,
    });

    if (stripePaymentMethod.error) {
      Alert.alert("Failed", stripePaymentMethod.error.message);
      setIsSubmitting(false);
      return;
    }

    let paymentMethod: PaymentMethodInterface = {
      id: stripePaymentMethod.paymentMethod.id,
      customerId,
      personId: person.id,
      email: person.contactInfo.email,
      name: person.name.display,
    };
    const result = await ApiHelper.post("/paymentmethods/addcard", paymentMethod, "GivingApi");
    if (result?.raw?.message) {
      Alert.alert("Failed to create payment method: ", result?.raw?.message);
    } else {
      setMode("display");
      await updatedFunction();
    }
    setIsSubmitting(false);
  };

  const updateCard = () => {};

  return (
    <InputBox
      title="Add New Card"
      headerIcon={<Image source={Images.ic_give} style={globalStyles.donationIcon} />}
      saveFunction={handleSave}
      cancelFunction={() => setMode("display")}
      isSubmitting={isSubmitting}
    >
      {!card.id ? (
        <View>
          <CardField
            postalCodeEnabled={true}
            placeholder={{ number: "4242 4242 4242 4242" }}
            cardStyle={{ backgroundColor: "#FFFFFF", textColor: "#000000" }}
            style={{ width: "100%", height: 50, marginTop: wp("2%"), backgroundColor: "white" }}
            onCardChange={(cardDetails) => {
              setCardDetails(cardDetails);
            }}
          />
        </View>
      ) : (
        <View style={globalStyles.cardDatesView}>
          <View>
            <Text style={{ ...globalStyles.searchMainText, marginTop: wp("4%") }}>Expiration Month</Text>
            <TextInput
              style={globalStyles.cardDates}
              keyboardType="number-pad"
              value={month}
              onChangeText={(text) => setMonth(text)}
              placeholder="MM"
              maxLength={2}
            />
          </View>
          <View>
            <Text style={{ ...globalStyles.searchMainText, marginTop: wp("4%") }}>Expiration Year</Text>
            <TextInput
              style={globalStyles.cardDates}
              keyboardType="number-pad"
              value={year}
              onChangeText={(text) => setYear(text)}
              placeholder="YY"
              maxLength={2}
            />
          </View>
        </View>
      )}
    </InputBox>
  );
}

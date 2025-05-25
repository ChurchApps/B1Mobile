import { ApiHelper, Constants, UserHelper, globalStyles } from "@/src/helpers";
import { PaymentMethodInterface, StripeCardUpdateInterface, StripePaymentMethod } from "@/src/interfaces";
import { DimensionHelper } from "@churchapps/mobilehelper";
import { CardField, CardFieldInput, useStripe } from "@stripe/stripe-react-native";
import React, { useState } from "react";
import { Alert, Image, Text, TextInput, View } from "react-native";
import { InputBox } from "../exports";

interface Props {
  setMode: any;
  card: StripePaymentMethod;
  customerId: string;
  updatedFunction: () => void;
  handleDelete: () => void;
}

export function CardForm({ setMode, card, customerId, updatedFunction, handleDelete }: Props) {
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [month, setMonth] = React.useState<string>(card.exp_month?.toString() || "");
  const [year, setYear] = React.useState<string>(card.exp_year?.toString().slice(-2) || "");
  const { createPaymentMethod } = useStripe();
  const person = UserHelper.currentUserChurch?.person;

  const handleSave = () => {
    setIsSubmitting(true);
    return card.id ? updateCard() : createCard();
  };

  const createCard = async () => {
    const stripePaymentMethod = await createPaymentMethod({
      paymentMethodType: 'Card',
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
      // email: person.contactInfo.email,
      // name: person.name.display,
      email: person?.contactInfo?.email,
      name: person?.name?.display,
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

  const updateCard = async () => {
    if (!month || !year) {
      setIsSubmitting(false);
      Alert.alert("Cannot be left blank", "Expiration year & month cannot be left blank");
      return;
    }

    const payload: StripeCardUpdateInterface = {
      personId: person.id,
      paymentMethodId: card.id,
      cardData: { card: { exp_month: month, exp_year: year } },
    };

    const result = await ApiHelper.post("/paymentmethods/updatecard", payload, "GivingApi");
    if (result?.raw?.message) {
      Alert.alert("Update failed", result.raw.message);
    } else {
      setMonth("");
      setYear("");
      setMode("display");
      await updatedFunction();
    }
    setIsSubmitting(false);
  };

  return (
    <InputBox
      title="Add New Card"
      headerIcon={<Image source={Constants.Images.ic_give} style={globalStyles.donationIcon} />}
      saveFunction={handleSave}
      cancelFunction={() => setMode("display")}
      isSubmitting={isSubmitting}
      deleteFunction={card.id ? handleDelete : undefined}
    >
      {!card.id ? (
        <View>
          <CardField
            postalCodeEnabled={true}
            placeholders={{ number: "4242 4242 4242 4242" }}
            cardStyle={{ backgroundColor: "#FFFFFF", textColor: "#000000", placeholderColor: "#808080" }}
            style={{ width: "100%", height: 50, marginTop: DimensionHelper.wp("2%"), backgroundColor: "white" }}
            onCardChange={(cardDetails) => {
              setCardDetails(cardDetails);
            }}
          />
        </View>
      ) : (
        <View style={globalStyles.cardDatesView}>
          <View>
            <Text style={{ ...globalStyles.searchMainText, marginTop: DimensionHelper.wp("4%") }}>Expiration Month</Text>
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
            <Text style={{ ...globalStyles.searchMainText, marginTop: DimensionHelper.wp("4%") }}>Expiration Year</Text>
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

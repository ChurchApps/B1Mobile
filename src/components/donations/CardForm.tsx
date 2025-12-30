import { ApiHelper } from "../../../src/helpers";
import { PaymentMethodInterface, StripeCardUpdateInterface, StripePaymentMethod } from "../../../src/interfaces";
import { CardField, CardFieldInput, useStripe } from "@stripe/stripe-react-native";
import React, { useState } from "react";
import { Alert, View } from "react-native";
import { Button, Card, IconButton, Text, TextInput } from "react-native-paper";
import { useAppTheme } from "../../../src/theme";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import { useTranslation } from "react-i18next";

interface Props {
  setMode: (mode: "display" | "edit") => void;
  card: StripePaymentMethod;
  customerId: string;
  updatedFunction: () => void;
  handleDelete: () => void;
}

export function CardForm({ setMode, card, customerId, updatedFunction, handleDelete }: Props) {
  const { t } = useTranslation();
  const { theme, spacing } = useAppTheme();
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [month, setMonth] = React.useState<string>(card.exp_month?.toString() || "");
  const [year, setYear] = React.useState<string>(card.exp_year?.toString().slice(-2) || "");
  const { createPaymentMethod } = useStripe();
  const currentUserChurch = useCurrentUserChurch();
  const person = currentUserChurch?.person;
  const [cardHolderName, setCardHolderName] = useState(person?.name?.display || "");

  const handleSave = () => {
    setIsSubmitting(true);
    return card.id ? updateCard() : createCard();
  };

  const createCard = async () => {
    if (!person?.id) {
      Alert.alert(t("donations.error"), t("donations.userInfoNotAvailable"));
      setIsSubmitting(false);
      return;
    }

    const stripePaymentMethod = await createPaymentMethod({
      paymentMethodType: "Card",
      ...cardDetails
    });

    if (stripePaymentMethod.error) {
      Alert.alert(t("donations.failed"), stripePaymentMethod.error.message);
      setIsSubmitting(false);
      return;
    }

    let paymentMethod: PaymentMethodInterface = {
      id: stripePaymentMethod.paymentMethod.id,
      customerId,
      personId: person.id,
      email: person?.contactInfo?.email,
      name: cardHolderName || person?.name?.display
    };
    const result = await ApiHelper.post("/paymentmethods/addcard", paymentMethod, "GivingApi");
    if (result?.raw?.message) {
      Alert.alert(t("donations.failedToCreatePaymentMethod"), result?.raw?.message);
    } else {
      setMode("display");
      await updatedFunction();
    }
    setIsSubmitting(false);
  };

  const updateCard = async () => {
    if (!person?.id) {
      Alert.alert(t("donations.error"), t("donations.userInfoNotAvailable"));
      setIsSubmitting(false);
      return;
    }

    if (!month || !year) {
      setIsSubmitting(false);
      Alert.alert(t("donations.cannotBeLeftBlank"), t("donations.expirationCannotBeBlank"));
      return;
    }

    const payload: StripeCardUpdateInterface = {
      personId: person.id,
      paymentMethodId: card.id,
      cardData: { card: { exp_month: month, exp_year: year } }
    };

    const result = await ApiHelper.post("/paymentmethods/updatecard", payload, "GivingApi");
    if (result?.raw?.message) {
      Alert.alert(t("donations.updateFailed"), result.raw.message);
    } else {
      setMonth("");
      setYear("");
      setMode("display");
      await updatedFunction();
    }
    setIsSubmitting(false);
  };

  const informationalText = !card.id && (
    <Text variant="bodySmall" style={{ marginVertical: spacing.md, textAlign: "center" }}>
      {t("donations.creditCardChargeInfo")}
    </Text>
  );

  return (
    <Card style={{ marginBottom: spacing.md }}>
      <Card.Title title={card.id ? t("donations.editCard") : t("donations.addNewCard")} titleStyle={{ fontSize: 20, fontWeight: "600" }} left={props => <IconButton {...props} icon="credit-card" size={24} iconColor={theme.colors.primary} style={{ margin: 0 }} />} />
      <Card.Content>
        {!card.id ? (
          <View style={{ marginBottom: spacing.md }}>
            <TextInput mode="outlined" label={t("donations.cardHolderName")} value={cardHolderName} onChangeText={setCardHolderName} style={{ marginBottom: spacing.sm }} />
            <CardField postalCodeEnabled={true} placeholders={{ number: "4242 4242 4242 4242", cvc: "123" }} cardStyle={{ backgroundColor: theme.colors.surface, textColor: theme.colors.onSurface }} style={{ height: 50, marginBottom: spacing.sm }} onCardChange={setCardDetails} />
          </View>
        ) : (
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md }}>
            <TextInput mode="outlined" label={t("donations.expirationMonth")} value={month} onChangeText={setMonth} keyboardType="number-pad" maxLength={2} style={{ flex: 1, marginRight: spacing.sm }} />
            <TextInput mode="outlined" label={t("donations.expirationYear")} value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={2} style={{ flex: 1, marginLeft: spacing.sm }} />
          </View>
        )}

        {informationalText}

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md }}>
          {card.id && (
            <Button mode="outlined" onPress={handleDelete} style={{ flex: 1, marginRight: spacing.sm }}>
              {t("common.delete")}
            </Button>
          )}
          <Button mode="outlined" onPress={() => setMode("display")} style={{ flex: card.id ? 1 : 1, marginRight: card.id ? spacing.sm : 0 }}>
            {t("common.cancel")}
          </Button>
          <Button mode="contained" onPress={handleSave} loading={isSubmitting} style={{ flex: 1, marginLeft: card.id ? spacing.sm : spacing.sm }}>
            {t("common.save")}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

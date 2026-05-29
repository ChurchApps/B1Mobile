import { ApiHelper } from "../../../src/helpers";
import { PaymentMethodInterface, StripeCardUpdateInterface, StripePaymentMethod } from "../../../src/interfaces";
import { CardField, CardFieldInput, useStripe } from "@stripe/stripe-react-native";
import React, { useRef, useState } from "react";
import { Alert, View } from "react-native";
import { Button, Card, IconButton, Text, TextInput } from "react-native-paper";
import { useAppTheme } from "../../../src/theme";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import { useTranslation } from "react-i18next";
import { KingdomFundingTokenWebView, KFTokenWebViewHandle } from "./KingdomFundingTokenWebView";

interface Props {
  setMode: (mode: "display" | "edit") => void;
  card: StripePaymentMethod;
  customerId: string;
  updatedFunction: () => void;
  handleDelete: () => void;
  isKingdomFunding?: boolean;
  kfTokenizationKey?: string;
  kfSandbox?: boolean;
}

export function CardForm({ setMode, card, customerId, updatedFunction, handleDelete, isKingdomFunding, kfTokenizationKey, kfSandbox }: Props) {
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
  const kfTokenRef = useRef<KFTokenWebViewHandle>(null);

  const handleSave = () => {
    setIsSubmitting(true);
    if (isKingdomFunding && !card.id) return createCardKF();
    return card.id ? updateCard() : createCard();
  };

  const createCardKF = async () => {
    if (!person?.id) {
      Alert.alert(t("donations.error"), t("donations.userInfoNotAvailable"));
      setIsSubmitting(false);
      return;
    }
    if (!kfTokenRef.current) {
      Alert.alert(t("donations.error"), "Payment form not ready. Please wait a moment and try again.");
      setIsSubmitting(false);
      return;
    }
    try {
      const tokenResult = await kfTokenRef.current.getNonce();
      const paymentMethod: any = {
        id: `nonce-${tokenResult.nonce}`,
        customerId,
        personId: person.id,
        email: person?.contactInfo?.email,
        name: cardHolderName || person?.name?.display,
        provider: "kingdomfunding",
        cardBrand: tokenResult.cardType,
        cardLast4: tokenResult.last4,
        expiry_month: tokenResult.expiryMonth,
        expiry_year: tokenResult.expiryYear
      };
      const result = await ApiHelper.post("/paymentmethods/addcard", paymentMethod, "GivingApi");
      if (result?.error) {
        Alert.alert(t("donations.failedToCreatePaymentMethod"), result.error);
      } else {
        setMode("display");
        await updatedFunction();
      }
    } catch (err: any) {
      Alert.alert(t("donations.failed"), err?.message || "Failed to add card");
    }
    setIsSubmitting(false);
  };

  const createCard = async () => {
    if (!person?.id) {
      Alert.alert(t("donations.error"), t("donations.userInfoNotAvailable"));
      setIsSubmitting(false);
      return;
    }

    const stripePaymentMethod = await createPaymentMethod({ paymentMethodType: "Card", ...cardDetails });

    if (stripePaymentMethod.error) {
      Alert.alert(t("donations.failed"), stripePaymentMethod.error.message);
      setIsSubmitting(false);
      return;
    }

    const paymentMethod: PaymentMethodInterface = { id: stripePaymentMethod.paymentMethod.id, customerId, personId: person.id, email: person?.contactInfo?.email, name: cardHolderName || person?.name?.display };
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

  // For KingdomFunding + existing card: only show delete/cancel (no editing fields)
  if (isKingdomFunding && card.id) {
    return (
      <Card style={{ marginBottom: spacing.md }}>
        <Card.Title title={t("donations.editCard")} titleStyle={{ fontSize: 20, fontWeight: "600" }} left={props => <IconButton {...props} icon="credit-card" size={24} iconColor={theme.colors.primary} style={{ margin: 0 }} />} />
        <Card.Content>
          <Text variant="bodyMedium" style={{ marginBottom: spacing.md }}>
            {`${card.name} ending in ${card.last4}`}
          </Text>
          <Text variant="bodySmall" style={{ marginBottom: spacing.md, color: theme.colors.onSurfaceVariant }}>
            Card details cannot be edited for this payment provider. You may delete this payment method and add a new one.
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md }}>
            <Button mode="outlined" onPress={() => setMode("display")} style={{ flex: 1, marginRight: spacing.sm }}>
              {t("common.cancel")}
            </Button>
            <Button mode="contained" onPress={handleDelete} buttonColor={theme.colors.error} textColor={theme.colors.onError} style={{ flex: 1, marginLeft: spacing.sm }}>
              {t("common.delete")}
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: spacing.md }}>
      <Card.Title title={card.id ? t("donations.editCard") : t("donations.addNewCard")} titleStyle={{ fontSize: 20, fontWeight: "600" }} left={props => <IconButton {...props} icon="credit-card" size={24} iconColor={theme.colors.primary} style={{ margin: 0 }} />} />
      <Card.Content>
        {!card.id ? (
          <View style={{ marginBottom: spacing.md }}>
            <TextInput mode="outlined" label={t("donations.cardHolderName")} value={cardHolderName} onChangeText={setCardHolderName} style={{ marginBottom: spacing.sm }} />
            {isKingdomFunding && kfTokenizationKey ? (
              <KingdomFundingTokenWebView ref={kfTokenRef} tokenizationKey={kfTokenizationKey} sandbox={kfSandbox} />
            ) : (
              <CardField postalCodeEnabled={true} placeholders={{ number: "4242 4242 4242 4242", cvc: "123" }} cardStyle={{ backgroundColor: theme.colors.surface, textColor: theme.colors.onSurface }} style={{ height: 50, marginBottom: spacing.sm }} onCardChange={setCardDetails} />
            )}
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

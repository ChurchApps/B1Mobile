import { ApiHelper, UserHelper } from "../../../src/helpers";
import { PaymentMethodInterface, StripeCardUpdateInterface, StripePaymentMethod } from "../../../src/interfaces";
import { CardField, CardFieldInput, useStripe } from "@stripe/stripe-react-native";
import React, { useState } from "react";
import { Alert, View } from "react-native";
import { Button, Card, IconButton, Menu, Text, TextInput } from "react-native-paper";
import { useAppTheme } from "../../../src/theme";

interface Props {
  setMode: (mode: "display" | "edit") => void;
  card: StripePaymentMethod;
  customerId: string;
  updatedFunction: () => void;
  handleDelete: () => void;
}

export function CardForm({ setMode, card, customerId, updatedFunction, handleDelete }: Props) {
  const { theme, spacing } = useAppTheme();
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [month, setMonth] = React.useState<string>(card.exp_month?.toString() || "");
  const [year, setYear] = React.useState<string>(card.exp_year?.toString().slice(-2) || "");
  const { createPaymentMethod } = useStripe();
  const person = UserHelper.currentUserChurch?.person;
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [selectedType, setSelectedType] = useState(card.type || "card");
  const cardTypes = [
    { label: "Visa", value: "visa" },
    { label: "Mastercard", value: "mastercard" },
    { label: "American Express", value: "amex" },
    { label: "Discover", value: "discover" },
    { label: "JCB", value: "jcb" },
    { label: "Diners Club", value: "dinersclub" },
    { label: "UnionPay", value: "unionpay" }
  ];

  const handleSave = () => {
    setIsSubmitting(true);
    return card.id ? updateCard() : createCard();
  };

  const createCard = async () => {
    const stripePaymentMethod = await createPaymentMethod({
      paymentMethodType: "Card",
      ...cardDetails
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
      name: person?.name?.display
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
      cardData: { card: { exp_month: month, exp_year: year } }
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

  const informationalText = !card.id && (
    <Text variant="bodySmall" style={{ marginVertical: spacing.md, textAlign: "center" }}>
      Credit cards will be charged immediately for one-time donations. For recurring donations, your card will be charged on the date you select.
    </Text>
  );

  return (
    <Card style={{ marginBottom: spacing.md }}>
      <Card.Title
        title={card.id ? "Edit Card" : "Add New Card"}
        titleStyle={{ fontSize: 20, fontWeight: "600" }}
        left={props => <IconButton {...props} icon="credit-card" size={24} iconColor={theme.colors.primary} style={{ margin: 0 }} />}
      />
      <Card.Content>
        {!card.id ? (
          <View style={{ marginBottom: spacing.md }}>
            <TextInput mode="outlined" label="Card Holder Name" value={person?.name?.display} disabled style={{ marginBottom: spacing.sm }} />
            <CardField
              postalCodeEnabled={true}
              placeholders={{ number: "4242 4242 4242 4242", cvc: "123" }}
              cardStyle={{ backgroundColor: theme.colors.surface, textColor: theme.colors.onSurface }}
              style={{ height: 50, marginBottom: spacing.sm }}
              onCardChange={setCardDetails}
            />
            <Menu
              visible={showTypeMenu}
              onDismiss={() => setShowTypeMenu(false)}
              anchor={
                <Button mode="outlined" onPress={() => setShowTypeMenu(true)} style={{ marginBottom: spacing.sm }}>
                  {cardTypes.find(t => t.value === selectedType)?.label || "Select Card Type"}
                </Button>
              }>
              {cardTypes.map(type => (
                <Menu.Item
                  key={type.value}
                  onPress={() => {
                    setSelectedType(type.value);
                    setShowTypeMenu(false);
                  }}
                  title={type.label}
                />
              ))}
            </Menu>
          </View>
        ) : (
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md }}>
            <TextInput mode="outlined" label="Expiration Month" value={month} onChangeText={setMonth} keyboardType="number-pad" maxLength={2} style={{ flex: 1, marginRight: spacing.sm }} />
            <TextInput mode="outlined" label="Expiration Year" value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={2} style={{ flex: 1, marginLeft: spacing.sm }} />
          </View>
        )}

        {informationalText}

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md }}>
          {card.id && (
            <Button mode="outlined" onPress={handleDelete} style={{ flex: 1, marginRight: spacing.sm }}>
              Delete
            </Button>
          )}
          <Button mode="outlined" onPress={() => setMode("display")} style={{ flex: card.id ? 1 : 1, marginRight: card.id ? spacing.sm : 0 }}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSave} loading={isSubmitting} style={{ flex: 1, marginLeft: card.id ? spacing.sm : spacing.sm }}>
            Save
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

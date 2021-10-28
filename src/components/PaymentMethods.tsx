import * as React from "react";
import { TouchableOpacity, View, Text, ActivityIndicator, Alert, Image, TextInput } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/FontAwesome";
import { CardField, useStripe, CardFieldInput } from "@stripe/stripe-react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { FlatList } from "react-native-gesture-handler";
import { DisplayBox, SelectPaymentMethod } from ".";
import Colors from "../utils/Colors";
import { ApiHelper, globalStyles, Userhelper } from "../helper";
import { PaymentMethodInterface, StripeCardUpdateInterface, StripePaymentMethod } from "../interfaces";
import Images from "../utils/Images";

type Methods = "Add Card" | "Add Bank" | "Handle Card Edit";

interface Props {
  customerId: string;
  paymentMethods: StripePaymentMethod[];
  updatedFunction: () => void;
  isLoading: boolean;
}

export function PaymentMethods({ customerId, paymentMethods, updatedFunction, isLoading }: Props) {
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = React.useState<Methods>();
  const [card, setCard] = React.useState<CardFieldInput.Details>();
  const [isSaving, setIsaving] = React.useState<boolean>(false);
  const [cardToEdit, setCardToEdit] = React.useState<StripePaymentMethod>();
  const [month, setMonth] = React.useState<string>("");
  const [year, setYear] = React.useState<string>("");
  const { createPaymentMethod } = useStripe();
  const person = Userhelper.person;

  const handleSave = () => {
    cardToEdit?.id ? updateCard() : createCard();
  };

  const updateCard = async () => {
    if (!month || !year) {
      Alert.alert("Cannot be left blank", "Expiration year & month cannot be left blank");
      return;
    }
    setIsaving(true);

    const payload: StripeCardUpdateInterface = {
      personId: person.id,
      paymentMethodId: cardToEdit?.id || "",
      cardData: { card: { exp_month: month, exp_year: year } },
    };

    const result = await ApiHelper.post("/paymentmethods/updatecard", payload, "GivingApi");
    if (result?.raw?.message) {
      Alert.alert("Update failed", result.raw.message);
    } else {
      setSelectedMethod(undefined);
      updatedFunction();
      setMonth("");
      setYear("");
    }
    setIsaving(false);
  };

  const createCard = async () => {
    setIsaving(true);
    const stripePaymentMethod = await createPaymentMethod({
      type: "Card",
      ...card,
    });

    if (stripePaymentMethod.error) {
      Alert.alert("Failed", stripePaymentMethod.error.message);
      setIsaving(false);
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
      setSelectedMethod(undefined);
      await updatedFunction();
    }
    setIsaving(false);
  };

  const handleEdit = (item: StripePaymentMethod) => {
    setSelectedMethod("Handle Card Edit");
    setCardToEdit(item);
    setMonth(item.exp_month?.toString() || "");
    setYear(item.exp_year?.toString().slice(-2) || "");
  };

  const handleDelete = () => {
    Alert.alert("Are you sure?", "This will permantly delete this payment method", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "OK",
        onPress: async () => {
          try {
            await ApiHelper.delete("/paymentmethods/" + cardToEdit?.id + "/" + customerId, "GivingApi");
            setSelectedMethod(undefined);
            await updatedFunction();
          } catch (err) {
            Alert.alert("Error in deleting the method");
          }
        },
      },
    ]);
  };

  let contentBody = null;
  let boxTitle = null;
  switch (selectedMethod) {
    case "Add Card":
      contentBody = (
        <View>
          <CardField
            postalCodeEnabled={true}
            placeholder={{ number: "4242 4242 4242 4242" }}
            cardStyle={{ backgroundColor: "#FFFFFF", textColor: "#000000" }}
            style={{ width: "100%", height: 50, marginTop: wp("2%"), backgroundColor: "white" }}
            onCardChange={(cardDetails) => {
              setCard(cardDetails);
            }}
          />
        </View>
      );
      boxTitle = "Add New Card";
      break;
    case "Add Bank":
      boxTitle = "Add New Bank Account";
      break;
    case "Handle Card Edit":
      contentBody = (
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
      );
      boxTitle = cardToEdit?.name.toUpperCase() + "****" + cardToEdit?.last4;
      break;
    default:
      contentBody =
        paymentMethods.length > 0 ? (
          <FlatList
            data={paymentMethods}
            renderItem={({ item }) => (
              <View style={globalStyles.cardListView} key={item.id}>
                <Text style={globalStyles.cardListText}> {item.name + " ****" + item.last4}</Text>
                <TouchableOpacity onPress={() => handleEdit(item)}>
                  <FontAwesome5 name={"pencil-alt"} style={{ color: Colors.app_color }} size={wp("5.5%")} />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item: any) => item.id}
            ItemSeparatorComponent={({ item }) => <View style={globalStyles.cardListSeperator} />}
          />
        ) : (
          <Text style={globalStyles.paymentDetailText}>No payment methods.</Text>
        );
      boxTitle = "Payment Methods";
      break;
  }

  const rightHeaderContent = !selectedMethod && (
    <TouchableOpacity onPress={() => setShowModal(true)}>
      <Icon name={"plus"} style={{ color: Colors.button_green }} size={wp("6%")} />
    </TouchableOpacity>
  );
  const widthClass = selectedMethod === "Handle Card Edit" ? wp("33.33%") : wp("50%");
  const footerContent = selectedMethod && (
    <View style={{ ...globalStyles.previewBtnView }}>
      <TouchableOpacity
        style={{ ...globalStyles.actionButtons, backgroundColor: Colors.button_yellow, width: widthClass }}
        onPress={() => {
          setSelectedMethod(undefined);
          setCardToEdit(undefined);
        }}
        disabled={isSaving}
      >
        <Text style={globalStyles.previewBtnText}>Cancel</Text>
      </TouchableOpacity>
      {selectedMethod === "Handle Card Edit" && (
        <TouchableOpacity
          style={{ ...globalStyles.actionButtons, backgroundColor: Colors.button_red, width: widthClass }}
          onPress={() => {
            handleDelete();
          }}
          disabled={isSaving}
        >
          <Text style={globalStyles.previewBtnText}>Delete</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={{ ...globalStyles.actionButtons, backgroundColor: Colors.button_dark_green, width: widthClass }}
        onPress={() => handleSave()}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="gray" animating={isSaving} />
        ) : (
          <Text style={globalStyles.previewBtnText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const boxIcon = cardToEdit ? (
    <Image source={Images.ic_give} style={globalStyles.donationIcon} />
  ) : (
    <Icon name={"credit-card-alt"} style={{ color: "gray" }} size={wp("5.5%")} />
  );
  return (
    <>
      <SelectPaymentMethod
        show={showModal}
        close={() => setShowModal(false)}
        onSelect={(type: Methods) => setSelectedMethod(type)}
      />
      <DisplayBox
        title={boxTitle}
        rightHeaderComponent={rightHeaderContent}
        headerIcon={boxIcon}
      >
        {isLoading ? (
          <ActivityIndicator size="large" style={{ margin: wp("2%") }} color="gray" animating={isLoading} />
        ) : (
          <>
            {contentBody}
            {/* {footerContent} */}
          </>
        )}
      </DisplayBox>
    </>
  );
}

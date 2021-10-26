import * as React from "react";
import { TouchableOpacity, View, Text, ActivityIndicator, Alert } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/FontAwesome";
import { CardField, useStripe, CardFieldInput } from "@stripe/stripe-react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { FlatList } from "react-native-gesture-handler";
import { DisplayBox, SelectPaymentMethod, Loader } from ".";
import Colors from "../utils/Colors";
import { ApiHelper, globalStyles, Userhelper } from "../helper";
import { PaymentMethodInterface, StripePaymentMethod } from "../interfaces";

type Methods = "Add Card" | "Add Bank";

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
  const { createPaymentMethod } = useStripe();
  const person = Userhelper.person;

  const handleSave = async () => {
    setIsaving(true);
    const stripePaymentMethod = await createPaymentMethod({
      type: "Card",
      ...card,
    });

    if (stripePaymentMethod.error) {
      Alert.alert("Failed", stripePaymentMethod.error.message);
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

  let contentBody = null;
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
      break;
    case "Add Bank":
      break;
    default:
      contentBody =
        paymentMethods.length > 0 ? (
          <FlatList
            data={paymentMethods}
            renderItem={({ item }) => (
              <View style={globalStyles.cardListView} key={item.id}>
                <Text style={globalStyles.cardListText}> {item.name + " ****" + item.last4}</Text>
                <TouchableOpacity onPress={() => {}}>
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
      break;
  }

  const rightHeaderContent = (
    <TouchableOpacity onPress={() => setShowModal(true)}>
      <Icon name={"plus"} style={{ color: Colors.button_green }} size={wp("6%")} />
    </TouchableOpacity>
  );
  const footerContent = selectedMethod && (
    <View style={{ ...globalStyles.previewBtnView }}>
      <TouchableOpacity
        style={{ ...globalStyles.previewBtn, backgroundColor: Colors.button_yellow }}
        onPress={() => setSelectedMethod(undefined)}
        disabled={isSaving}
      >
        <Text style={globalStyles.previewBtnText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ ...globalStyles.previewBtn, backgroundColor: Colors.button_dark_green }}
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

  return (
    <>
      <SelectPaymentMethod
        show={showModal}
        close={() => setShowModal(false)}
        onSelect={(type: Methods) => setSelectedMethod(type)}
      />
      <DisplayBox
        title="Payment Methods"
        rightHeaderComponent={rightHeaderContent}
        headerIcon={<Icon name={"credit-card-alt"} style={{ color: "gray" }} size={wp("5.5%")} />}
        footer={footerContent}
      >
        {isLoading ? (
          <ActivityIndicator size="large" style={{ margin: wp("2%") }} color="gray" animating={isLoading} />
        ) : (
          contentBody
        )}
      </DisplayBox>
    </>
  );
}

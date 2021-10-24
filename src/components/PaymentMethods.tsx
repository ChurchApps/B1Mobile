import * as React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/FontAwesome";
import { CardField, useStripe, CardFieldInput } from "@stripe/stripe-react-native";
import { DisplayBox, SelectPaymentMethod } from ".";
import Colors from "../utils/Colors";
import { ApiHelper, globalStyles, Userhelper } from "../helper";
import { PaymentMethodInterface } from "../interfaces";

type Methods = "Add Card" | "Add Bank";

interface Props {
  customerId: string;
}

export function PaymentMethods({ customerId }: Props) {
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = React.useState<Methods>();
  const [card, setCard] = React.useState<CardFieldInput.Details>();
  const { createPaymentMethod } = useStripe();
  const person = Userhelper.person;

  const handleSave = async () => {
    const stripePaymentMethod = await createPaymentMethod({
      type: "Card",
      ...card,
    });

    if (stripePaymentMethod.error) {
      console.log(stripePaymentMethod.error.message);
      return;
    }

    let paymentMethod: PaymentMethodInterface = {
      id: stripePaymentMethod.paymentMethod.id,
      customerId,
      personId: person.id,
      email: person.contactInfo.email,
      name: person.name.display,
    };
    const result = await ApiHelper.post("/paymentmethods/addcard", paymentMethod, "GivingApi")
    if (result?.raw?.message) {
      console.log("There was an error creating the payment method: ", result?.raw?.message);
    } else {
      console.log("card Successfully created: ", result)
      setSelectedMethod(undefined)
    }
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
      contentBody = <Text style={globalStyles.paymentDetailText}>No payment methods.</Text>;
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
      >
        <Text style={globalStyles.previewBtnText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ ...globalStyles.previewBtn, backgroundColor: Colors.button_dark_green }}
        onPress={() => handleSave()}
      >
        <Text style={globalStyles.previewBtnText}>Save</Text>
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
        {contentBody}
      </DisplayBox>
    </>
  );
}

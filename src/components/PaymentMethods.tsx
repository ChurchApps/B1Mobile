import * as React from "react";
import { TouchableOpacity, View, Text, ActivityIndicator, Alert, Image, TextInput } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/FontAwesome";
import { CardField, useStripe, CardFieldInput } from "@stripe/stripe-react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { FlatList } from "react-native-gesture-handler";
import { DisplayBox, SelectPaymentMethod, CardForm } from ".";
import Colors from "../utils/Colors";
import { ApiHelper, globalStyles, Userhelper } from "../helper";
import { PaymentMethodInterface, StripeCardUpdateInterface, StripePaymentMethod, Permissions } from "../interfaces";
import Images from "../utils/Images";
import { useIsFocused } from "@react-navigation/native";

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
  const [editPaymentMethod, setEditPaymentMethod] = React.useState<StripePaymentMethod>(new StripePaymentMethod());
  const [verify, setVerify] = React.useState<boolean>(false);
  const isFocused = useIsFocused();

  // const [card, setCard] = React.useState<CardFieldInput.Details>();
  // const [isSaving, setIsaving] = React.useState<boolean>(false);
  // const [cardToEdit, setCardToEdit] = React.useState<StripePaymentMethod>();
  // const [month, setMonth] = React.useState<string>("");
  // const [year, setYear] = React.useState<string>("");
  const [mode, setMode] = React.useState<"display" | "edit">("display");
  // const { createPaymentMethod } = useStripe();
  // const person = Userhelper.person;

  // const handleSave = () => {
  //   cardToEdit?.id ? updateCard() : createCard();
  // };

  // const updateCard = async () => {
  //   if (!month || !year) {
  //     Alert.alert("Cannot be left blank", "Expiration year & month cannot be left blank");
  //     return;
  //   }
  //   setIsaving(true);

  //   const payload: StripeCardUpdateInterface = {
  //     personId: person.id,
  //     paymentMethodId: cardToEdit?.id || "",
  //     cardData: { card: { exp_month: month, exp_year: year } },
  //   };

  //   const result = await ApiHelper.post("/paymentmethods/updatecard", payload, "GivingApi");
  //   if (result?.raw?.message) {
  //     Alert.alert("Update failed", result.raw.message);
  //   } else {
  //     setSelectedMethod(undefined);
  //     updatedFunction();
  //     setMonth("");
  //     setYear("");
  //   }
  //   setIsaving(false);
  // };

  // const handleEdit = (item: StripePaymentMethod) => {
  //   setSelectedMethod("Handle Card Edit");
  //   setCardToEdit(item);
  //   setMonth(item.exp_month?.toString() || "");
  //   setYear(item.exp_year?.toString().slice(-2) || "");
  // };

  // const handleDelete = () => {
  //   Alert.alert("Are you sure?", "This will permantly delete this payment method", [
  //     {
  //       text: "Cancel",
  //       onPress: () => {},
  //       style: "cancel",
  //     },
  //     {
  //       text: "OK",
  //       onPress: async () => {
  //         try {
  //           await ApiHelper.delete("/paymentmethods/" + cardToEdit?.id + "/" + customerId, "GivingApi");
  //           setSelectedMethod(undefined);
  //           await updatedFunction();
  //         } catch (err) {
  //           Alert.alert("Error in deleting the method");
  //         }
  //       },
  //     },
  //   ]);
  // };

  // let contentBody = null;
  // let boxTitle = null;
  // switch (selectedMethod) {
  //   case "Add Card":
  //     contentBody = (
  //       <View>
  //         <CardField
  //           postalCodeEnabled={true}
  //           placeholder={{ number: "4242 4242 4242 4242" }}
  //           cardStyle={{ backgroundColor: "#FFFFFF", textColor: "#000000" }}
  //           style={{ width: "100%", height: 50, marginTop: wp("2%"), backgroundColor: "white" }}
  //           onCardChange={(cardDetails) => {
  //             setCard(cardDetails);
  //           }}
  //         />
  //       </View>
  //     );
  //     boxTitle = "Add New Card";
  //     break;
  //   case "Add Bank":
  //     boxTitle = "Add New Bank Account";
  //     break;
  //   case "Handle Card Edit":
  //     contentBody = (
  //       <View style={globalStyles.cardDatesView}>
  //         <View>
  //           <Text style={{ ...globalStyles.searchMainText, marginTop: wp("4%") }}>Expiration Month</Text>
  //           <TextInput
  //             style={globalStyles.cardDates}
  //             keyboardType="number-pad"
  //             value={month}
  //             onChangeText={(text) => setMonth(text)}
  //             placeholder="MM"
  //             maxLength={2}
  //           />
  //         </View>
  //         <View>
  //           <Text style={{ ...globalStyles.searchMainText, marginTop: wp("4%") }}>Expiration Year</Text>
  //           <TextInput
  //             style={globalStyles.cardDates}
  //             keyboardType="number-pad"
  //             value={year}
  //             onChangeText={(text) => setYear(text)}
  //             placeholder="YY"
  //             maxLength={2}
  //           />
  //         </View>
  //       </View>
  //     );
  //     boxTitle = cardToEdit?.name.toUpperCase() + "****" + cardToEdit?.last4;
  //     break;
  //   default:
  //     contentBody =
  //       paymentMethods.length > 0 ? (
  //         <FlatList
  //           data={paymentMethods}
  //           renderItem={({ item }) => (
  //             <View style={globalStyles.cardListView} key={item.id}>
  //               <Text style={globalStyles.cardListText}> {item.name + " ****" + item.last4}</Text>
  //               <TouchableOpacity onPress={() => handleEdit(item)}>
  //                 <FontAwesome5 name={"pencil-alt"} style={{ color: Colors.app_color }} size={wp("5.5%")} />
  //               </TouchableOpacity>
  //             </View>
  //           )}
  //           keyExtractor={(item: any) => item.id}
  //           ItemSeparatorComponent={({ item }) => <View style={globalStyles.cardListSeperator} />}
  //         />
  //       ) : (
  //         <Text style={globalStyles.paymentDetailText}>No payment methods.</Text>
  //       );
  //     boxTitle = "Payment Methods";
  //     break;
  // }

  const rightHeaderContent = !selectedMethod && (
    <TouchableOpacity onPress={() => setShowModal(true)}>
      <Icon name={"plus"} style={{ color: Colors.button_green }} size={wp("6%")} />
    </TouchableOpacity>
  );

  React.useEffect(() => {
    if (isFocused) {
      setMode("display");
      setEditPaymentMethod(new StripePaymentMethod());
    }
  }, [isFocused]);

  const handleEdit = (paymentMethod: StripePaymentMethod, verifyAccount?: boolean) => {
    setEditPaymentMethod(paymentMethod);
    setVerify(!!verifyAccount);
    setMode("edit");
  };

  let editModeContent = null;
  switch (editPaymentMethod.type) {
    case "card":
      editModeContent = (
        <CardForm
          setMode={setMode}
          card={editPaymentMethod}
          customerId={customerId}
          updatedFunction={updatedFunction}
        />
      );
      break;
    case "bank":
      editModeContent = <Text>Bank method</Text>;
      break;
  }

  const getEditButton = (item: StripePaymentMethod) => {
    if (!Userhelper.checkAccess(Permissions.givingApi.settings.edit)) return null;
    return (
      <TouchableOpacity onPress={() => handleEdit(item)}>
        <FontAwesome5 name={"pencil-alt"} style={{ color: Colors.app_color }} size={wp("5.5%")} />
      </TouchableOpacity>
    );
  };

  const paymentTable =
    paymentMethods.length > 0 ? (
      <FlatList
        data={paymentMethods}
        renderItem={({ item }) => (
          <View style={globalStyles.cardListView} key={item.id}>
            <Text style={globalStyles.cardListText}> {item.name + " ****" + item.last4}</Text>
            {getEditButton(item)}
          </View>
        )}
        keyExtractor={(item: any) => item.id}
        ItemSeparatorComponent={({ item }) => <View style={globalStyles.cardListSeperator} />}
      />
    ) : (
      <Text style={globalStyles.paymentDetailText}>No payment methods.</Text>
    );

  const content =
    mode === "display" ? (
      <DisplayBox
        title="Payment Methods"
        rightHeaderComponent={rightHeaderContent}
        headerIcon={<Icon name={"credit-card-alt"} style={{ color: "gray" }} size={wp("5.5%")} />}
      >
        {isLoading ? (
          <ActivityIndicator size="large" style={{ margin: wp("2%") }} color="gray" animating={isLoading} />
        ) : (
          paymentTable
        )}
      </DisplayBox>
    ) : (
      editModeContent
    );
  return (
    <>
      <SelectPaymentMethod show={showModal} close={() => setShowModal(false)} onSelect={handleEdit} />
      {content}
    </>
  );
}

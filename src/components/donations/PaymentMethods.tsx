import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, ActivityIndicator, Alert } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { FlatList } from "react-native-gesture-handler";
import { CardForm, BankForm } from ".";
import { DisplayBox, SelectPaymentMethod } from "../";
import Colors from "../../utils/Colors";
import { globalStyles, UserHelper, ApiHelper } from "../../helper";
import { StripePaymentMethod, Permissions } from "../../interfaces";
import { useIsFocused } from "@react-navigation/native";

interface Props {
  customerId: string;
  paymentMethods: StripePaymentMethod[];
  updatedFunction: () => void;
  isLoading: boolean;
  publishKey: string;
}

export function PaymentMethods({ customerId, paymentMethods, updatedFunction, isLoading, publishKey }: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editPaymentMethod, setEditPaymentMethod] = useState<StripePaymentMethod>(new StripePaymentMethod());
  const [verify, setVerify] = useState<boolean>(false);
  const [mode, setMode] = useState<"display" | "edit">("display");
  const isFocused = useIsFocused();

  const rightHeaderContent = (
    <TouchableOpacity onPress={() => setShowModal(true)}>
      <Icon name={"plus"} style={{ color: Colors.button_green }} size={wp("6%")} />
    </TouchableOpacity>
  );

  useEffect(() => {
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

  const handleDelete = () => {
    Alert.alert("Are you sure?", "This will permantly delete this payment method", [
      {
        text: "Cancel",
        onPress: () => { },
        style: "cancel",
      },
      {
        text: "OK",
        onPress: async () => {
          try {
            await ApiHelper.delete("/paymentmethods/" + editPaymentMethod.id + "/" + customerId, "GivingApi");
            setMode("display");
            await updatedFunction();
          } catch (err) {
            Alert.alert("Error in deleting the method");
          }
        },
      },
    ]);
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
          handleDelete={handleDelete}
        />
      );
      break;
    case "bank":
      editModeContent = (
        <BankForm
          setMode={setMode}
          bank={editPaymentMethod}
          customerId={customerId}
          updatedFunction={updatedFunction}
          handleDelete={handleDelete}
          showVerifyForm={verify}
          publishKey={publishKey}
        />
      );
      break;
  }

  const getEditButton = (item: StripePaymentMethod) => {
    if (!UserHelper.checkAccess(Permissions.givingApi.settings.edit)) return null;
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
            {item?.status === "new" && (
              <TouchableOpacity onPress={() => handleEdit(item, true)}>
                <Text style={{ color: Colors.app_color, width: wp("10%") }}>Verify</Text>
              </TouchableOpacity>
            )}
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


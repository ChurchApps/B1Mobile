import React, { useState } from "react";
import { Text, Image, View, TextInput, Alert } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import DropDownPicker from "react-native-dropdown-picker";
import { useStripe } from "@stripe/stripe-react-native";
import { PaymentMethodInterface, StripePaymentMethod } from "../interfaces";
import { InputBox } from ".";
import Images from "../utils/Images";
import { globalStyles, Userhelper, ApiHelper, StripeHelper } from "../helper";

interface Props {
  setMode: any;
  bank: StripePaymentMethod;
  customerId: string;
  updatedFunction: () => void;
  handleDelete: () => void;
  showVerifyForm: boolean;
  publishKey: string;
}

const accountTypes = [
  {
    label: "Individual",
    value: "individual",
  },
  {
    label: "Company",
    value: "company",
  },
];

export function BankForm({
  bank,
  customerId,
  setMode,
  updatedFunction,
  handleDelete,
  showVerifyForm,
  publishKey,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState(accountTypes[0].value);
  const [name, setName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [routingNumber, setRoutingNumber] = useState<string>("");
  const {} = useStripe();
  const person = Userhelper.person

  const handleSave = () => {
    setIsSubmitting(true);
    if (showVerifyForm) {
      verifyBank();
      return;
    }
    if (bank.id) {
      updateBank();
      return;
    }
    createBank();
  };

  const updateBank = () => {};

  const createBank = async () => {
    if (!routingNumber || !accountNumber) {
      setIsSubmitting(false)
      Alert.alert("Cannot be left blank", "Account number & Routing number are required!");
      return
    }

    const response = await StripeHelper.createToken(publishKey, {
      "bank_account[country]": "US",
      "bank_account[currency]": "usd",
      "bank_account[account_holder_name]": name,
      "bank_account[account_holder_type]": selectedType,
      "bank_account[routing_number]": routingNumber,
      "bank_account[account_number]": accountNumber
    });

    if (response?.error?.message) {
      Alert.alert("Error", response.error.message)
      setIsSubmitting(false)
    } else {
      const paymentMethod: PaymentMethodInterface = {
        id: response.id,
        customerId,
        personId: person.id,
        email: person.contactInfo.email,
        name: person.name.display,
      }

      const result = await ApiHelper.post("/paymentmethods/addbankaccount", paymentMethod, "GivingApi")
      if (result?.raw?.message) {
        Alert.alert("Error", result.raw.message)
      } else {
        setMode("display");
        await updatedFunction();
      }
    }

    setIsSubmitting(false)
  };

  const verifyBank = () => {};

  const informationalText = !bank.id && (
    <View style={{ marginTop: wp("5%"), flex: 1, alignItems: "center" }}>
      <Text style={{ width: wp("90%"), fontSize: wp("4.5%") }}>
        Bank accounts will need to be verified before making any donations. Your account will receive two small deposits
        in approximately 1-3 business days. You will need to enter those deposit amounts to finish verifying your
        account by selecting the verify account link next to your bank account under the payment methods section.
      </Text>
    </View>
  );
  return (
    <InputBox
      title="Add New Bank Account"
      headerIcon={<Image source={Images.ic_give} style={globalStyles.donationIcon} />}
      saveFunction={handleSave}
      cancelFunction={() => setMode("display")}
      isSubmitting={isSubmitting}
    >
      {informationalText}
      {showVerifyForm ? (
        <View style={{ marginTop: wp("5%"), marginBottom: wp("5%") }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ width: wp("90%"), fontSize: wp("4.5%") }}>
              Enter the two deposits you received in your account to finish verifying your bank account.
            </Text>
          </View>
          <Text style={globalStyles.semiTitleText}>First Deposit</Text>
          <View style={{ flex: 1 }}>
            <TextInput
              style={{ ...globalStyles.fundInput, width: wp("90%") }}
              keyboardType="number-pad"
              value={accountNumber}
              onChangeText={(text) => setAccountNumber(text)}
            />
            <Text style={globalStyles.semiTitleText}>Second Deposit</Text>
            <TextInput
              style={{ ...globalStyles.fundInput, width: wp("90%") }}
              keyboardType="number-pad"
              value={routingNumber}
              onChangeText={(text) => setRoutingNumber(text)}
            />
          </View>
        </View>
      ) : (
        <View style={{ marginBottom: wp("5%") }}>
          <Text style={globalStyles.semiTitleText}>Amount Holder Name</Text>
          <TextInput
            style={{ ...globalStyles.fundInput, width: wp("90%") }}
            keyboardType="default"
            value={name}
            onChangeText={(text) => setName(text)}
          />
          <Text style={globalStyles.semiTitleText}>Account Holder Type</Text>
          <View style={{ width: wp("100%"), marginBottom: wp("12%") }}>
            <DropDownPicker
              listMode="SCROLLVIEW"
              items={accountTypes}
              open={isDropdownOpen}
              setOpen={setIsDropdownOpen}
              value={selectedType}
              setValue={setSelectedType}
              containerStyle={{
                ...globalStyles.containerStyle,
                width: wp("90%"),
                height: isDropdownOpen ? accountTypes.length * wp("12%") : 0,
              }}
              style={{ ...globalStyles.dropDownMainStyle, height: wp("12%") }}
              labelStyle={globalStyles.labelStyle}
              listItemContainerStyle={globalStyles.itemStyle}
              dropDownContainerStyle={{ ...globalStyles.dropDownStyle, width: wp("90%") }}
              scrollViewProps={{ nestedScrollEnabled: true }}
            />
          </View>
          <Text style={globalStyles.semiTitleText}>Account Number</Text>
          <TextInput
            style={{ ...globalStyles.fundInput, width: wp("90%") }}
            keyboardType="number-pad"
            value={accountNumber}
            onChangeText={(text) => setAccountNumber(text)}
          />
          <Text style={globalStyles.semiTitleText}>Routing Number</Text>
          <TextInput
            style={{ ...globalStyles.fundInput, width: wp("90%") }}
            keyboardType="number-pad"
            value={routingNumber}
            onChangeText={(text) => setRoutingNumber(text)}
          />
        </View>
      )}
    </InputBox>
  );
}

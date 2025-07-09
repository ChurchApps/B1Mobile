import { ApiHelper, Constants, UserHelper, globalStyles } from "../../../src/helpers";
import { PaymentMethodInterface, StripeBankAccountUpdateInterface, StripeBankAccountVerifyInterface, StripePaymentMethod } from "../../../src/interfaces";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { useState } from "react";
import { Alert, Image, Text, TextInput, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { InputBox } from "../InputBox";
import { useStripe } from "@stripe/stripe-react-native";

interface Props {
  setMode: (mode: string) => void;
  bank: StripePaymentMethod;
  customerId: string;
  updatedFunction: () => void;
  handleDelete: () => void;
  showVerifyForm: boolean;
}

const accountTypes = [
  {
    label: "Individual",
    value: "individual"
  },
  {
    label: "Company",
    value: "company"
  }
];

export function BankForm({ bank, customerId, setMode, updatedFunction, handleDelete, showVerifyForm }: Props) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState(bank.account_holder_type || accountTypes[0].value);
  const [name, setName] = useState<string>(bank.account_holder_name || "");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [routingNumber, setRoutingNumber] = useState<string>("");
  const [firstDeposit, setFirstDeposit] = useState<string>("");
  const [secondDeposit, setSecondDeposit] = useState<string>("");
  const person = UserHelper.currentUserChurch?.person;
  const { createToken } = useStripe();

  // Input validation functions
  const validateRoutingNumber = (routing: string): boolean =>
    // 9 digits for US routing numbers
    /^\d{9}$/.test(routing);
  const validateAccountNumber = (account: string): boolean =>
    // 4-17 digits for US account numbers
    /^\d{4,17}$/.test(account);
  // Format routing number with visual grouping
  const formatRoutingNumber = (value: string): string => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length <= 9) {
      return cleanValue.replace(/(\d{3})(\d{3})(\d{0,3})/, (match, p1, p2, p3) => {
        if (p3) return `${p1}-${p2}-${p3}`;
        if (p2) return `${p1}-${p2}`;
        return p1;
      });
    }
    return cleanValue.slice(0, 9);
  };

  // Handle routing number input with formatting
  const handleRoutingNumberChange = (text: string): void => {
    const cleaned = text.replace(/\D/g, "");
    formatRoutingNumber(cleaned);
    setRoutingNumber(cleaned); // Store clean value for API
  };

  // Handle account number input with length limit
  const handleAccountNumberChange = (text: string): void => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 17) {
      setAccountNumber(cleaned);
    }
  };

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

  const updateBank = async () => {
    if (!name) {
      setIsSubmitting(false);
      Alert.alert("Required", "Please enter account holder name");
      return;
    }

    const payload: StripeBankAccountUpdateInterface = {
      paymentMethodId: bank.id,
      customerId,
      personId: person.id,
      bankData: {
        account_holder_name: name,
        account_holder_type: selectedType
      }
    };

    const response = await ApiHelper.post("/paymentmethods/updatebank", payload, "GivingApi");
    if (response?.raw?.message) {
      Alert.alert("Error", response.raw.message);
    } else {
      setMode("display");
      await updatedFunction();
    }

    setIsSubmitting(false);
  };

  const createBank = async () => {
    if (!routingNumber || !accountNumber) {
      setIsSubmitting(false);
      Alert.alert("Cannot be left blank", "Account number & Routing number are required!");
      return;
    }

    // Input validation
    if (!validateRoutingNumber(routingNumber)) {
      setIsSubmitting(false);
      Alert.alert("Invalid Routing Number", "Please enter a valid 9-digit routing number.");
      return;
    }

    if (!validateAccountNumber(accountNumber)) {
      setIsSubmitting(false);
      Alert.alert("Invalid Account Number", "Please enter a valid account number (4-17 digits).");
      return;
    }

    try {
      // Use modern Stripe React Native SDK
      const tokenResult = await createToken({
        type: "BankAccount",
        bankAccount: {
          routingNumber: routingNumber,
          accountNumber: accountNumber,
          accountHolderType: selectedType as "Individual" | "Company",
          accountHolderName: name,
          country: "US",
          currency: "usd"
        }
      });

      if (tokenResult.error) {
        Alert.alert("Error", tokenResult.error.message);
        setIsSubmitting(false);
        return;
      }

      const paymentMethod: PaymentMethodInterface = {
        id: tokenResult.token.id,
        customerId,
        personId: person.id,
        email: person.contactInfo.email,
        name: person.name.display
      };

      const result = await ApiHelper.post("/paymentmethods/addbankaccount", paymentMethod, "GivingApi");
      if (result?.raw?.message) {
        Alert.alert("Error", result.raw.message);
      } else {
        setMode("display");
        await updatedFunction();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create bank account token");
    }

    setIsSubmitting(false);
  };

  const verifyBank = async () => {
    if (!firstDeposit || !secondDeposit) {
      setIsSubmitting(false);
      Alert.alert("Error", "Please enter both deposit amounts");
      return;
    }

    const verifyPayload: StripeBankAccountVerifyInterface = {
      paymentMethodId: bank.id,
      customerId,
      amountData: { amounts: [firstDeposit, secondDeposit] }
    };

    const response = await ApiHelper.post("/paymentmethods/verifyBank", verifyPayload, "GivingApi");
    if (response?.raw?.message) {
      Alert.alert("Error", response.raw.message);
    } else {
      setMode("display");
      await updatedFunction();
    }

    setIsSubmitting(false);
  };

  const informationalText = !bank.id && (
    <View style={{ marginTop: DimensionHelper.wp(5), flex: 1, alignItems: "center" }}>
      <Text style={{ width: DimensionHelper.wp(90), fontSize: DimensionHelper.wp(4.5) }}>Bank accounts will need to be verified before making any donations. Your account will receive two small deposits in approximately 1-3 business days. You will need to enter those deposit amounts to finish verifying your account by selecting the verify account link next to your bank account under the payment methods section.</Text>
    </View>
  );
  return (
    <InputBox title={bank.id ? `${bank.name.toUpperCase()} ****${bank.last4}` : "Add New Bank Account"} headerIcon={<Image source={Constants.Images.ic_give} style={globalStyles.donationIcon} />} saveFunction={handleSave} cancelFunction={() => setMode("display")} deleteFunction={bank.id && !showVerifyForm ? handleDelete : undefined} isSubmitting={isSubmitting}>
      {informationalText}
      {showVerifyForm ? (
        <View style={{ marginTop: DimensionHelper.wp(5), marginBottom: DimensionHelper.wp(5) }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ width: DimensionHelper.wp(90), fontSize: DimensionHelper.wp(4.5) }}>Enter the two deposits you received in your account to finish verifying your bank account.</Text>
          </View>
          <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: DimensionHelper.wp(95) }}>
            <View>
              <Text style={globalStyles.semiTitleText}>First Deposit</Text>
              <TextInput style={{ ...globalStyles.fundInput, width: DimensionHelper.wp(40) }} keyboardType="number-pad" value={firstDeposit} onChangeText={text => setFirstDeposit(text)} />
            </View>
            <View>
              <Text style={globalStyles.semiTitleText}>Second Deposit</Text>
              <TextInput style={{ ...globalStyles.fundInput, width: DimensionHelper.wp(40) }} keyboardType="number-pad" value={secondDeposit} onChangeText={text => setSecondDeposit(text)} />
            </View>
          </View>
        </View>
      ) : (
        <View style={{ marginBottom: DimensionHelper.wp(5) }}>
          <Text style={globalStyles.semiTitleText}>Amount Holder Name</Text>
          <TextInput style={{ ...globalStyles.fundInput, width: DimensionHelper.wp(90) }} keyboardType="default" value={name} onChangeText={text => setName(text)} />
          <Text style={globalStyles.semiTitleText}>Account Holder Type</Text>
          <View style={{ width: DimensionHelper.wp(100), marginBottom: DimensionHelper.wp(12) }}>
            <DropDownPicker
              listMode="SCROLLVIEW"
              items={accountTypes}
              open={isDropdownOpen}
              setOpen={setIsDropdownOpen}
              value={selectedType}
              setValue={setSelectedType}
              containerStyle={{
                ...globalStyles.containerStyle,
                width: DimensionHelper.wp(90),
                height: isDropdownOpen ? accountTypes.length * DimensionHelper.wp(12) : 0
              }}
              style={{ ...globalStyles.dropDownMainStyle, height: DimensionHelper.wp(12) }}
              labelStyle={globalStyles.labelStyle}
              listItemContainerStyle={globalStyles.itemStyle}
              dropDownContainerStyle={{ ...globalStyles.dropDownStyle, width: DimensionHelper.wp(90) }}
              scrollViewProps={{ nestedScrollEnabled: true }}
              dropDownDirection="BOTTOM"
            />
          </View>
          {!bank.id && (
            <>
              <Text style={globalStyles.semiTitleText}>Account Number</Text>
              <TextInput style={{ ...globalStyles.fundInput, width: DimensionHelper.wp(90) }} keyboardType="number-pad" value={accountNumber} onChangeText={handleAccountNumberChange} placeholder="Enter account number" maxLength={17} secureTextEntry={false} autoComplete="off" textContentType="none" />
              <Text style={globalStyles.semiTitleText}>Routing Number</Text>
              <TextInput
                style={{ ...globalStyles.fundInput, width: DimensionHelper.wp(90) }}
                keyboardType="number-pad"
                value={formatRoutingNumber(routingNumber)}
                onChangeText={handleRoutingNumberChange}
                placeholder="123-456-789"
                maxLength={11} // Includes dashes
                autoComplete="off"
                textContentType="none"
              />
            </>
          )}
        </View>
      )}
    </InputBox>
  );
}

import { ApiHelper, Constants, globalStyles } from "../../../src/helpers";
import { PaymentMethodInterface, StripeBankAccountUpdateInterface, StripeBankAccountVerifyInterface, StripePaymentMethod } from "../../../src/interfaces";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { useState } from "react";
import { Alert, Image, Text, TextInput, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { InputBox } from "../InputBox";
import { useStripe } from "@stripe/stripe-react-native";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import { useTranslation } from "react-i18next";

interface Props {
  setMode: (mode: string) => void;
  bank: StripePaymentMethod;
  customerId: string;
  updatedFunction: () => void;
  handleDelete: () => void;
  showVerifyForm: boolean;
}

const getAccountTypes = (t: (key: string) => string) => [
  {
    label: t("donations.individual"),
    value: "individual"
  },
  {
    label: t("donations.company"),
    value: "company"
  }
];

export function BankForm({ bank, customerId, setMode, updatedFunction, handleDelete, showVerifyForm }: Props) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const accountTypes = getAccountTypes(t);
  const [selectedType, setSelectedType] = useState(bank.account_holder_type || accountTypes[0].value);
  const [name, setName] = useState<string>(bank.account_holder_name || "");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [routingNumber, setRoutingNumber] = useState<string>("");
  const [firstDeposit, setFirstDeposit] = useState<string>("");
  const [secondDeposit, setSecondDeposit] = useState<string>("");
  const currentUserChurch = useCurrentUserChurch();
  const person = currentUserChurch?.person;
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
    if (!person?.id) {
      Alert.alert(t("donations.error"), t("donations.userInfoNotAvailable"));
      setIsSubmitting(false);
      return;
    }

    if (!name) {
      setIsSubmitting(false);
      Alert.alert(t("donations.required"), t("donations.enterAccountHolderName"));
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
      Alert.alert(t("donations.error"), response.raw.message);
    } else {
      setMode("display");
      await updatedFunction();
    }

    setIsSubmitting(false);
  };

  const createBank = async () => {
    if (!person?.id || !person?.contactInfo?.email || !person?.name?.display) {
      Alert.alert(t("donations.error"), t("donations.userInfoIncomplete"));
      setIsSubmitting(false);
      return;
    }

    if (!routingNumber || !accountNumber) {
      setIsSubmitting(false);
      Alert.alert(t("donations.cannotBeLeftBlank"), t("donations.accountRoutingRequired"));
      return;
    }

    // Input validation
    if (!validateRoutingNumber(routingNumber)) {
      setIsSubmitting(false);
      Alert.alert(t("donations.invalidRoutingNumber"), t("donations.invalidRoutingNumberMessage"));
      return;
    }

    if (!validateAccountNumber(accountNumber)) {
      setIsSubmitting(false);
      Alert.alert(t("donations.invalidAccountNumber"), t("donations.invalidAccountNumberMessage"));
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
        Alert.alert(t("donations.error"), tokenResult.error.message);
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
        Alert.alert(t("donations.error"), result.raw.message);
      } else {
        setMode("display");
        await updatedFunction();
      }
    } catch (error: any) {
      Alert.alert(t("donations.error"), error.message || t("donations.failedToCreateBankToken"));
    }

    setIsSubmitting(false);
  };

  const verifyBank = async () => {
    if (!firstDeposit || !secondDeposit) {
      setIsSubmitting(false);
      Alert.alert(t("donations.error"), t("donations.enterBothDeposits"));
      return;
    }

    const verifyPayload: StripeBankAccountVerifyInterface = {
      paymentMethodId: bank.id,
      customerId,
      amountData: { amounts: [firstDeposit, secondDeposit] }
    };

    const response = await ApiHelper.post("/paymentmethods/verifyBank", verifyPayload, "GivingApi");
    if (response?.raw?.message) {
      Alert.alert(t("donations.error"), response.raw.message);
    } else {
      setMode("display");
      await updatedFunction();
    }

    setIsSubmitting(false);
  };

  const informationalText = !bank.id && (
    <View style={{ marginTop: DimensionHelper.wp(5), flex: 1, alignItems: "center" }}>
      <Text style={{ width: DimensionHelper.wp(90), fontSize: DimensionHelper.wp(4.5) }}>{t("donations.bankVerificationInfo")}</Text>
    </View>
  );
  return (
    <InputBox title={bank.id ? `${bank.name.toUpperCase()} ****${bank.last4}` : t("donations.addNewBankAccount")} headerIcon={<Image source={Constants.Images.ic_give} style={globalStyles.donationIcon} />} saveFunction={handleSave} cancelFunction={() => setMode("display")} deleteFunction={bank.id && !showVerifyForm ? handleDelete : undefined} isSubmitting={isSubmitting}>
      {informationalText}
      {showVerifyForm ? (
        <View style={{ marginTop: DimensionHelper.wp(5), marginBottom: DimensionHelper.wp(5) }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ width: DimensionHelper.wp(90), fontSize: DimensionHelper.wp(4.5) }}>{t("donations.enterDepositsToVerify")}</Text>
          </View>
          <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: DimensionHelper.wp(95) }}>
            <View>
              <Text style={globalStyles.semiTitleText}>{t("donations.firstDeposit")}</Text>
              <TextInput style={{ ...globalStyles.fundInput, width: DimensionHelper.wp(40) }} keyboardType="number-pad" value={firstDeposit} onChangeText={text => setFirstDeposit(text)} />
            </View>
            <View>
              <Text style={globalStyles.semiTitleText}>{t("donations.secondDeposit")}</Text>
              <TextInput style={{ ...globalStyles.fundInput, width: DimensionHelper.wp(40) }} keyboardType="number-pad" value={secondDeposit} onChangeText={text => setSecondDeposit(text)} />
            </View>
          </View>
        </View>
      ) : (
        <View style={{ marginBottom: DimensionHelper.wp(5) }}>
          <Text style={globalStyles.semiTitleText}>{t("donations.accountHolderName")}</Text>
          <TextInput style={{ ...globalStyles.fundInput, width: DimensionHelper.wp(90) }} keyboardType="default" value={name} onChangeText={text => setName(text)} />
          <Text style={globalStyles.semiTitleText}>{t("donations.accountHolderType")}</Text>
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
              <Text style={globalStyles.semiTitleText}>{t("donations.accountNumber")}</Text>
              <TextInput style={{ ...globalStyles.fundInput, width: DimensionHelper.wp(90) }} keyboardType="number-pad" value={accountNumber} onChangeText={handleAccountNumberChange} placeholder={t("donations.enterAccountNumber")} maxLength={17} secureTextEntry={false} autoComplete="off" textContentType="none" />
              <Text style={globalStyles.semiTitleText}>{t("donations.routingNumber")}</Text>
              <TextInput
                style={{ ...globalStyles.fundInput, width: DimensionHelper.wp(90) }}
                keyboardType="number-pad"
                value={formatRoutingNumber(routingNumber)}
                onChangeText={handleRoutingNumberChange}
                placeholder={t("donations.routingNumberPlaceholder")}
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

import { ApiHelper, Constants, globalStyles } from "../../../src/helpers";
import { StripeBankAccountUpdateInterface, StripeBankAccountVerifyInterface, StripePaymentMethod } from "../../../src/interfaces";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { useState } from "react";
import { Alert, Image, Text, TextInput, View, ActivityIndicator } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { InputBox } from "../InputBox";
import { collectBankAccountForSetup, confirmSetupIntent } from "@stripe/stripe-react-native";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../theme";

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
  const colors = useThemeColors();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const accountTypes = getAccountTypes(t);
  const [selectedType, setSelectedType] = useState(bank.account_holder_type || accountTypes[0].value);
  const [name, setName] = useState<string>(bank.account_holder_name || "");
  const [firstDeposit, setFirstDeposit] = useState<string>("");
  const [secondDeposit, setSecondDeposit] = useState<string>("");
  const [bankConnecting, setBankConnecting] = useState<boolean>(false);
  const currentUserChurch = useCurrentUserChurch();
  const person = currentUserChurch?.person;

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

    setBankConnecting(true);

    try {
      // Step 1: Create ACH SetupIntent on the backend
      const setupResponse = await ApiHelper.post("/paymentmethods/ach-setup-intent", {
        personId: person.id,
        customerId,
        email: person.contactInfo.email,
        name: name.trim() || person.name.display
      }, "GivingApi");

      if (setupResponse?.error) {
        Alert.alert(t("donations.error"), setupResponse.error);
        setBankConnecting(false);
        setIsSubmitting(false);
        return;
      }

      // Step 2: Collect bank account using Financial Connections
      const { setupIntent: collectedSetupIntent, error: collectError } = await collectBankAccountForSetup(
        setupResponse.clientSecret,
        {
          paymentMethodType: "USBankAccount",
          paymentMethodData: {
            billingDetails: {
              name: name.trim() || person.name.display,
              email: person.contactInfo.email
            }
          }
        }
      );

      if (collectError) {
        Alert.alert(t("donations.error"), collectError.message || t("donations.failedToCreateBankToken"));
        setBankConnecting(false);
        setIsSubmitting(false);
        return;
      }

      if (!collectedSetupIntent?.paymentMethod?.id) {
        Alert.alert(t("donations.error"), t("donations.bankConnectionNotCompleted"));
        setBankConnecting(false);
        setIsSubmitting(false);
        return;
      }

      // Step 3: Confirm the SetupIntent
      const { setupIntent: confirmedIntent, error: confirmError } = await confirmSetupIntent(
        setupResponse.clientSecret,
        { paymentMethodType: "USBankAccount" }
      );

      if (confirmError) {
        Alert.alert(t("donations.error"), confirmError.message || t("donations.failedToCreateBankToken"));
        setBankConnecting(false);
        setIsSubmitting(false);
        return;
      }

      if (confirmedIntent?.status === "Succeeded" || confirmedIntent?.status === "RequiresAction") {
        setMode("display");
        await updatedFunction();
      } else {
        Alert.alert(t("donations.error"), t("donations.unexpectedStatus"));
      }
    } catch (error: any) {
      Alert.alert(t("donations.error"), error.message || t("donations.failedToCreateBankToken"));
    }

    setBankConnecting(false);
    setIsSubmitting(false);
  };

  const verifyBank = async () => {
    if (!firstDeposit || !secondDeposit) {
      setIsSubmitting(false);
      Alert.alert(t("donations.error"), t("donations.enterBothDeposits"));
      return;
    }

    const verifyPayload: StripeBankAccountVerifyInterface = { paymentMethodId: bank.id, customerId, amountData: { amounts: [firstDeposit, secondDeposit] } };

    const response = await ApiHelper.post("/paymentmethods/verifyBank", verifyPayload, "GivingApi");
    if (response?.raw?.message) {
      Alert.alert(t("donations.error"), response.raw.message);
    } else {
      setMode("display");
      await updatedFunction();
    }

    setIsSubmitting(false);
  };

  return (
    <InputBox title={bank.id ? `${bank.name.toUpperCase()} ****${bank.last4}` : t("donations.addNewBankAccount")} headerIcon={<Image source={Constants.Images.ic_give} style={globalStyles.donationIcon} />} saveFunction={bank.id || showVerifyForm ? handleSave : undefined} cancelFunction={() => setMode("display")} deleteFunction={bank.id && !showVerifyForm ? handleDelete : undefined} isSubmitting={isSubmitting}>
      {showVerifyForm ? (
        <View style={{ marginTop: DimensionHelper.wp(5), marginBottom: DimensionHelper.wp(5) }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ width: DimensionHelper.wp(90), fontSize: DimensionHelper.wp(4.5) }}>{t("donations.enterDepositsToVerify")}</Text>
          </View>
          <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: DimensionHelper.wp(95) }}>
            <View>
              <Text style={globalStyles.semiTitleText}>{t("donations.firstDeposit")}</Text>
              <TextInput style={{ ...globalStyles.fundInput, color: colors.inputText, width: DimensionHelper.wp(40) }} keyboardType="number-pad" value={firstDeposit} onChangeText={text => setFirstDeposit(text)} />
            </View>
            <View>
              <Text style={globalStyles.semiTitleText}>{t("donations.secondDeposit")}</Text>
              <TextInput style={{ ...globalStyles.fundInput, color: colors.inputText, width: DimensionHelper.wp(40) }} keyboardType="number-pad" value={secondDeposit} onChangeText={text => setSecondDeposit(text)} />
            </View>
          </View>
        </View>
      ) : bank.id ? (
        <View style={{ marginBottom: DimensionHelper.wp(5) }}>
          <Text style={globalStyles.semiTitleText}>{t("donations.accountHolderName")}</Text>
          <TextInput style={{ ...globalStyles.fundInput, color: colors.inputText, width: DimensionHelper.wp(90) }} keyboardType="default" value={name} onChangeText={text => setName(text)} />
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
        </View>
      ) : (
        <View style={{ marginTop: DimensionHelper.wp(5), marginBottom: DimensionHelper.wp(5), alignItems: "center" }}>
          <Text style={{ width: DimensionHelper.wp(90), fontSize: DimensionHelper.wp(4.5), textAlign: "center", marginBottom: DimensionHelper.wp(3) }}>
            {t("donations.financialConnectionsInfo")}
          </Text>
          {bankConnecting ? (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: DimensionHelper.wp(3) }}>
              <ActivityIndicator size="small" />
              <Text style={{ marginLeft: DimensionHelper.wp(2) }}>{t("donations.connecting")}</Text>
            </View>
          ) : (
            <Text
              style={{ color: colors.primary, fontSize: DimensionHelper.wp(4.5), fontWeight: "600", marginTop: DimensionHelper.wp(3) }}
              onPress={handleSave}
            >
              {t("donations.connectBank")}
            </Text>
          )}
        </View>
      )}
    </InputBox>
  );
}

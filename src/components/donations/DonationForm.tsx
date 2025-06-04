import { ApiHelper, CacheHelper, CurrencyHelper, UserHelper, UserInterface, globalStyles } from "@/src/helpers"; // Constants removed
import { FundDonationInterface, FundInterface, PersonInterface, StripeDonationInterface, StripePaymentMethod, } from "@/src/interfaces";
import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import { CardField, CardFieldInput, createPaymentMethod } from "@stripe/stripe-react-native";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, View, StyleSheet } from "react-native"; // Text, TextInput, TouchableOpacity removed
import DropDownPicker from "react-native-dropdown-picker"; // External library
import { ModalDatePicker } from "react-native-material-date-picker"; // External library
import Icon from "react-native-vector-icons/FontAwesome"; // Kept for ModalDatePicker
// IconP for person/email icons will be replaced by Paper.TextInput.Icon
import { InputBox } from "../InputBox"; // Custom Component
import { PreviewModal } from "../modals/PreviewModal"; // Custom Component
import { FundDonations } from "./FundDonations"; // Custom Component
import { Button as PaperButton, Checkbox as PaperCheckbox, Text as PaperText, TextInput as PaperTextInput, useTheme } from 'react-native-paper';

interface Props {
  paymentMethods: StripePaymentMethod[];
  customerId: string;
  updatedFunction: () => void;
}

export function DonationForm({ paymentMethods: pm, customerId, updatedFunction }: Props) {
  const theme = useTheme();
  const person = UserHelper.currentUserChurch?.person;
  const user = UserHelper.user;
  const [donationType, setDonationType] = useState<string>("");
  const [isMethodsDropdownOpen, setIsMethodsDropdownOpen] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const [funds, setFunds] = useState<FundInterface[]>([]);
  const [fundDonations, setFundDonations] = useState<FundDonationInterface[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ label: string; value: string }[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details>();

  const [isChecked, setIsChecked] = useState(false); // For fees checkbox
  // const [toggleIcon, setToggleIcon] = useState('checkbox-passive'); // Replaced by isChecked for Paper.Checkbox status
  const [transactionFee, setTransactionFee] = useState<number>(0);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const initDonation: StripeDonationInterface = { /* ... same as original ... */
    id: pm[0]?.id, type: pm[0]?.type, customerId: customerId,
    person: { id: person?.id || "", email: user?.email || "", name: user?.firstName + " " + user?.lastName, },
    amount: 0, billing_cycle_anchor: +new Date(), interval: { interval_count: 1, interval: "month", }, funds: [],
  };
  const [donation, setDonation] = React.useState<StripeDonationInterface>(initDonation);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [isIntervalDropdownOpen, setIsIntervalDropdownOpen] = useState<boolean>(false);
  const [intervalTypes, setIntervalTypes] = useState<{ label: string; value: string }[]>([
    { label: "Weekly", value: "one_week" }, { label: "Bi-Weekly", value: "two_week" },
    { label: "Monthly", value: "one_month" }, { label: "Quarterly", value: "three_month" },
    { label: "Annually", value: "one_year" },
  ]);
  const [selectedInterval, setSelectedInterval] = useState<string>("one_week");

  // handleSave, handleCancel, loadData, handleFundDonationsChange, makeDonation, saveCard, saveDonation, handleIntervalChange, calculateTotalWithFees, getTransactionFee
  // ... All these functions remain largely the same, logic is not changing in this refactor step ...
  const handleSave = () => {
    if (donation.amount && donation.amount < 0.5) { Alert.alert("Donation amount must be greater than $0.50"); }
    else { if (!UserHelper.currentUserChurch?.person?.id) { donation.person = { id: "", email: email, name: firstName + " " + lastName, }; } setShowPreviewModal(true); }
  };
  const handleCancel = () => { setDonationType(""); };
  const loadData = async () => {
    var churchId: string = "";
    if (!UserHelper.currentUserChurch) { churchId = CacheHelper.church?.id || ""; }
    else if (!UserHelper.currentUserChurch.person?.id) { churchId = UserHelper.currentUserChurch.church.id ?? "";}
    else { churchId = CacheHelper.church?.id || ""; }
    ApiHelper.get("/funds/churchId/" + churchId, "GivingApi").then((data) => { setFunds(data); if (data.length) setFundDonations([{ fundId: data[0].id }]); });
   };
  const handleFundDonationsChange = (fd: FundDonationInterface[]) => {
    setFundDonations(fd); let totalAmount = 0; let selectedFunds: any = [];
    for (const fundDonation of fd) { totalAmount += fundDonation.amount || 0; let fund = funds.find((fund: FundInterface) => fund.id === fundDonation.fundId); selectedFunds.push({ id: fundDonation.fundId, amount: fundDonation.amount || 0, name: fund?.name || "" });}
    let d = { ...donation }; d.amount = totalAmount; d.funds = selectedFunds; setDonation(d);
    setTotal(calculateTotalWithFees(totalAmount, isChecked)); setTransactionFee(getTransactionFee(totalAmount));
  };
  const makeDonation = async (message: string) => {
    const method = pm.find((pm) => pm.id === selectedMethod);
    if (!UserHelper.currentUserChurch?.person?.id) {
      ApiHelper.post("/users/loadOrCreate", { userEmail: email, firstName, lastName }, "MembershipApi")
        .catch(ex => { Alert.alert("Failed", ex.toString()); return; })
        .then(async userData => { const personData = { churchId: CacheHelper.church!.id, firstName, lastName, email }; const person = await ApiHelper.post("/people/loadOrCreate", personData, "MembershipApi"); saveCard(userData, person) });
    } else {
      const payload: StripeDonationInterface = { ...donation, id: selectedMethod, customerId: customerId, type: method?.type, billing_cycle_anchor: +new Date(date), amount: parseFloat(total.toFixed(2)), church: { subDomain: CacheHelper.church?.subDomain } };
      saveDonation(payload, '');
    }
  };
  const saveCard = async (user: UserInterface, person: PersonInterface) => {
    const stripePaymentMethod = await createPaymentMethod({ paymentMethodType: 'Card', ...cardDetails, });
    if (stripePaymentMethod.error) { Alert.alert("Failed", stripePaymentMethod.error.message); return; }
    else {
      const pm = { id: stripePaymentMethod.paymentMethod.id, personId: person.id, email: email, name: person.name.display, churchId: CacheHelper.church!.id }
      await ApiHelper.post("/paymentmethods/addcard", pm, "GivingApi").then(result => {
        if (result?.raw?.message) { Alert.alert("Failed", result.raw.message); }
        else {
          const d: { paymentMethod: StripePaymentMethod, customerId: string } = result;
          donation.person = { name: firstName + " " + lastName, id: person.id!, email: email, };
          const payload: StripeDonationInterface = { id: d.paymentMethod.id, customerId: d.customerId, type: d.paymentMethod?.type, amount: parseFloat(total.toFixed(2)), churchId: CacheHelper.church!.id, funds: donation.funds, person: donation.person, billing_cycle_anchor: +new Date(date), interval: donation.interval, church: { subDomain: CacheHelper.church?.subDomain } };
          saveDonation(payload, "");
        }
      });
    }
  }
  const saveDonation = async (payload: StripeDonationInterface, message: string) => {
    let results;
    if (donationType === "once") results = await ApiHelper.post("/donate/charge/", payload, "GivingApi");
    if (donationType === "recurring") results = await ApiHelper.post("/donate/subscribe/", payload, "GivingApi");
    if (results?.status === "succeeded" || results?.status === "pending" || results?.status === "active") {
      setShowPreviewModal(false); setDonationType(""); setTotal(0); setFundDonations([{ fundId: funds[0]?.id }]); setDonation(initDonation);
      setEmail(''); setFirstName(''); setLastName(''); setIsChecked(false); // Reset isChecked
      Alert.alert("Thank you for your donation.", message, [{ text: "OK", onPress: () => updatedFunction() }]);
    }
    if (results?.raw?.message) { setShowPreviewModal(false); Alert.alert("Failed to make a donation", results?.raw?.message); }
  }
  const handleIntervalChange = (key: string, value: any) => {
    const donationsCopy = { ...donation };
    switch (key) {
      case "number": if (donationsCopy.interval) donationsCopy.interval.interval_count = value; break;
      case "type":
        if (donationsCopy.interval) {
          switch (value) {
            case "one_week": donationsCopy.interval.interval_count = 1; donationsCopy.interval.interval = "week"; break;
            case "two_week": donationsCopy.interval.interval_count = 2; donationsCopy.interval.interval = "week"; break;
            case "one_month": donationsCopy.interval.interval_count = 1; donationsCopy.interval.interval = "month"; break;
            case "three_month": donationsCopy.interval.interval_count = 3; donationsCopy.interval.interval = "month"; break;
            case "one_year": donationsCopy.interval.interval_count = 1; donationsCopy.interval.interval = "year"; break;
          }
        }; break;
    }
    setDonation(donationsCopy);
  };
  const calculateTotalWithFees = (baseAmount: number, feeChecked: boolean) => { const feeAmount = feeChecked ? getTransactionFee(baseAmount) : 0; return baseAmount + feeAmount; };
  const getTransactionFee = (amount: number) => { const fixedFee = 0.30; const fixedPercent = 0.029; return Math.round(((amount + fixedFee) / (1 - fixedPercent) - amount) * 100) / 100; }

  const handleCheckboxPress = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    // setToggleIcon(newCheckedState ? 'checkbox-active' : 'checkbox-passive'); // Removed
    setTotal(calculateTotalWithFees(donation.amount || 0, newCheckedState));
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { setPaymentMethods(pm.map((p) => ({ label: `${p.name} ****${p.last4}`, value: p.id }))); }, [pm]);

  // Define styles using StyleSheet and theme
  const styles = StyleSheet.create({
    methodContainer: { ...globalStyles.methodContainer, marginBottom: theme.spacing?.md },
    methodButton: (type: string) => ({
      ...globalStyles.methodButton,
      backgroundColor: donationType === type ? theme.colors.primary : theme.colors.surface,
      borderColor: theme.colors.primary, // Added border for unselected
      borderWidth: 1, // Added border for unselected
    }),
    methodBtnText: (type: string) => ({
      ...globalStyles.methodBtnText,
      color: donationType === type ? theme.colors.onPrimary : theme.colors.primary,
    }),
    formSectionContainer: { width: DimensionHelper.wp(100), marginBottom: theme.spacing?.md },
    inputFieldContainer: { ...globalStyles.donationInputFieldContainer, borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceVariant },
    textInputStyle: { ...globalStyles.textInputStyle, color: theme.colors.onSurface, flex:1 }, // Ensure flex for PaperTextInput
    inputLabel: { ...globalStyles.searchMainText, marginTop: DimensionHelper.wp(5.5), color: theme.colors.onSurfaceVariant },
    notesInput: { ...globalStyles.notesInput, backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurface, borderColor: theme.colors.outline },
    feesContainer: { ...globalStyles.feesContainer, alignItems: 'center' }, // Align checkbox and text
    feesText: { ...globalStyles.feesText, color: theme.colors.onSurfaceVariant, flexShrink: 1, marginLeft: theme.spacing?.sm},
    totalText: { ...globalStyles.totalText, color: theme.colors.onSurface },
    dateInputView: { ...globalStyles.dateInput, borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceVariant },
    dateText: { ...globalStyles.dateText, color: theme.colors.onSurface },
    selectionIcon: { ...globalStyles.selectionIcon, color: theme.colors.primary },
    // Dropdown styles are complex and rely on globalStyles heavily. Minor theme adjustments here.
    dropdownContainerStyle: {...globalStyles.containerStyle, zIndex: isMethodsDropdownOpen || isIntervalDropdownOpen ? 2000 : 10 }, // Dynamic zIndex
    dropdownStyle: {...globalStyles.dropDownMainStyle, backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
    dropdownLabelStyle: {...globalStyles.labelStyle, color: theme.colors.onSurface },
    dropdownItemContainerStyle: {...globalStyles.itemStyle }, // Hover/selected states handled by DropDownPicker
    dropdownDropDownContainerStyle: {...globalStyles.dropDownStyle, backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },

  });


  return (
    <>
      <PreviewModal show={showPreviewModal} close={() => setShowPreviewModal(false)} donation={donation} paymentMethodName={paymentMethods?.filter((p) => p.value === selectedMethod)[0]?.label} donationType={donationType} handleDonate={makeDonation} isChecked={isChecked} transactionFee={transactionFee} />
      <InputBox title="Donate" headerIcon={<Image source={Constants.Images.ic_give} style={[globalStyles.donationIcon, { marginLeft: DimensionHelper.wp(4) }]} />} saveFunction={donationType ? handleSave : undefined} cancelFunction={donationType ? handleCancel : undefined}>
        <ScrollView nestedScrollEnabled={true} style={{paddingHorizontal: DimensionHelper.wp(2)}}>
          <View style={styles.methodContainer}>
            <PaperButton mode={donationType === "once" ? "contained" : "outlined"} onPress={() => setDonationType("once")} style={styles.methodButton("once")} labelStyle={styles.methodBtnText("once")}>
              Make a Donation
            </PaperButton>
            <PaperButton mode={donationType === "recurring" ? "contained" : "outlined"} onPress={() => { setDonationType("recurring"); setDonation({ ...donation, interval: { interval_count: 1, interval: "week" } }); }} style={styles.methodButton("recurring")} labelStyle={styles.methodBtnText("recurring")}>
              Make a Recurring Donation
            </PaperButton>
          </View>
          {donationType ? (
            <View>
              {!UserHelper.currentUserChurch?.person?.id ? (
                <View style={styles.formSectionContainer}>
                  <PaperTextInput label="First Name" value={firstName} onChangeText={setFirstName} style={styles.textInputStyle} mode="outlined" left={<PaperTextInput.Icon icon="account" color={theme.colors.primary}/>} />
                  <PaperTextInput label="Last Name" value={lastName} onChangeText={setLastName} style={styles.textInputStyle} mode="outlined" left={<PaperTextInput.Icon icon="account" color={theme.colors.primary}/>} />
                  <PaperTextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.textInputStyle} mode="outlined" left={<PaperTextInput.Icon icon="email" color={theme.colors.primary}/>} />
                </View>
              ) : null}
              <PaperText style={styles.inputLabel}>{UserHelper.currentUserChurch?.person?.id ? "Payment Method" : "Add Card"}</PaperText>
              {UserHelper.currentUserChurch?.person?.id ? (
                <View style={[styles.formSectionContainer, { zIndex: styles.dropdownContainerStyle.zIndex }]}>
                  <DropDownPicker
                    listMode="SCROLLVIEW" open={isMethodsDropdownOpen} items={paymentMethods} value={selectedMethod}
                    setOpen={setIsMethodsDropdownOpen} setValue={setSelectedMethod} setItems={setPaymentMethods}
                    containerStyle={{...styles.dropdownContainerStyle, height: isMethodsDropdownOpen ? paymentMethods.length * DimensionHelper.wp(12) + DimensionHelper.wp(12) : DimensionHelper.wp(12) }}
                    style={styles.dropdownStyle} labelStyle={styles.dropdownLabelStyle} listItemContainerStyle={styles.dropdownItemContainerStyle}
                    dropDownContainerStyle={styles.dropdownDropDownContainerStyle} scrollViewProps={{ scrollEnabled: true }} dropDownDirection="BOTTOM"
                    placeholder="Select a payment method"
                  />
                </View>
              ) : (
                <View style={[styles.inputFieldContainer, { width: DimensionHelper.wp(90), height: DimensionHelper.wp(14), padding: 10, marginTop: DimensionHelper.wp(3) }]}>
                  <CardField postalCodeEnabled={true} placeholders={{ number: "4242 4242 4242 4242", cvc: "123" }} cardStyle={{ backgroundColor: theme.colors.surface, textColor: theme.colors.onSurface, placeholderColor: theme.colors.onSurfaceDisabled }} style={{ width: "100%", height: 50 }} onCardChange={setCardDetails} />
                </View>
              )}
              {donationType === "once" ? null : (
                <View>
                  <PaperText style={styles.inputLabel}>
                    {donationType === "once" ? "Donation Date" : "Recurring Donation Start Date"}
                  </PaperText>
                  <View style={styles.dateInputView}>
                    <PaperText style={styles.dateText} numberOfLines={1}> {moment(date).format("YYYY-MM-DD")} </PaperText>
                    <ModalDatePicker button={<Icon name={"calendar-o"} style={styles.selectionIcon} size={DimensionHelper.wp(6)} />} locale="en" onSelect={(d: any) => { setDate(d); const dc = { ...donation }; dc.billing_cycle_anchor = d; setDonation(dc); }} isHideOnSelect={true} initialDate={new Date()} />
                  </View>
                </View>
              )}
              {donationType === "recurring" && (
                <View style={[globalStyles.intervalView, { zIndex: styles.dropdownContainerStyle.zIndex -10 }]}>
                  <View>
                    <PaperText style={globalStyles.semiTitleText}>Interval</PaperText>
                    <DropDownPicker
                      listMode="SCROLLVIEW" open={isIntervalDropdownOpen} items={intervalTypes} value={selectedInterval}
                      setOpen={setIsIntervalDropdownOpen} setValue={setSelectedInterval} onChangeValue={(v) => handleIntervalChange("type", v)}
                      containerStyle={{...styles.dropdownContainerStyle, height: isIntervalDropdownOpen ? intervalTypes.length * DimensionHelper.wp(12.5) + DimensionHelper.wp(12) : DimensionHelper.wp(12) }}
                      style={styles.dropdownStyle} labelStyle={styles.dropdownLabelStyle} listItemContainerStyle={styles.dropdownItemContainerStyle}
                      dropDownContainerStyle={styles.dropdownDropDownContainerStyle} scrollViewProps={{ scrollEnabled: true }} dropDownDirection="BOTTOM"
                      placeholder="Select an interval"
                    />
                  </View>
                </View>
              )}

              <PaperText style={globalStyles.semiTitleText}>Fund</PaperText>
              <FundDonations funds={funds} fundDonations={fundDonations} updatedFunction={handleFundDonationsChange} />
              {total >= 1 && (
                <View style={styles.feesContainer}>
                  <PaperCheckbox.Android status={isChecked ? 'checked' : 'unchecked'} onPress={handleCheckboxPress} color={theme.colors.primary} />
                  <PaperText style={styles.feesText} onPress={handleCheckboxPress}> {/* Make text pressable too */}
                    I'll generously add {CurrencyHelper.formatCurrency(transactionFee)} to cover the transaction fees so you can keep 100% of my donation.
                  </PaperText>
                </View>
              )}
              {total >= 1 && <PaperText style={styles.totalText}>Total Donation Amount: {CurrencyHelper.formatCurrency(total)}</PaperText>}
              <PaperText style={globalStyles.semiTitleText}>Notes</PaperText>
              <PaperTextInput
                multiline={true} numberOfLines={3} style={styles.notesInput} value={donation.notes || ""}
                onChangeText={(text) => { const dc = { ...donation }; dc.notes = text; setDonation(dc); }}
                mode="outlined" label="Optional notes"
              />
            </View>
          ) : null}
        </ScrollView>
      </InputBox >
    </>
  );
}

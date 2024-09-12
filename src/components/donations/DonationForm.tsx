import { DimensionHelper } from "@churchapps/mobilehelper";
import { CardField, CardFieldInput, createPaymentMethod } from "@stripe/stripe-react-native";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { ModalDatePicker } from "react-native-material-date-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import IconP from 'react-native-vector-icons/Fontisto';
import { FundDonations, } from ".";
import { InputBox, PreviewModal } from "../";
import { ApiHelper, CacheHelper, Constants, CurrencyHelper, UserHelper, UserInterface, globalStyles } from "../../helpers";
import { FundDonationInterface, FundInterface, PersonInterface, StripeDonationInterface, StripePaymentMethod, } from "../../interfaces";

interface Props {
  paymentMethods: StripePaymentMethod[];
  customerId: string;
  updatedFunction: () => void;
}

export function DonationForm({ paymentMethods: pm, customerId, updatedFunction }: Props) {
  const person = UserHelper.currentUserChurch?.person;
  const user = UserHelper.user
  const [donationType, setDonationType] = useState<string>("");
  const [isMethodsDropdownOpen, setIsMethodsDropdownOpen] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const [funds, setFunds] = useState<FundInterface[]>([]);
  const [fundDonations, setFundDonations] = useState<FundDonationInterface[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ label: string; value: string }[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details>();

  const [isChecked, setIsChecked] = useState(false);
  const [toggleIcon, setToggleIcon] = useState('checkbox-passive');
  const [transactionFee, setTransactionFee] = useState<number>(0);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const initDonation: StripeDonationInterface = {
    id: pm[0]?.id,
    type: pm[0]?.type,
    customerId: customerId,
    person: {
      id: person?.id || "",
      email: user?.email || "",
      name: user?.firstName + " " + user?.lastName,
    },
    amount: 0,
    billing_cycle_anchor: +new Date(),
    interval: {
      interval_count: 1,
      interval: "month",
    },
    funds: [],
  };
  const [donation, setDonation] = React.useState<StripeDonationInterface>(initDonation);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [isIntervalDropdownOpen, setIsIntervalDropdownOpen] = useState<boolean>(false);
  const [intervalTypes, setIntervalTypes] = useState<{ label: string; value: string }[]>([
    { label: "Weekly", value: "one_week" },
    { label: "Bi-Weekly", value: "two_week" },
    { label: "Monthly", value: "one_month" },
    { label: "Quarterly", value: "three_month" },
    { label: "Annually", value: "one_year" },
  ]);
  const [selectedInterval, setSelectedInterval] = useState<string>("one_week");


  const handleSave = () => {
    if (donation.amount && donation.amount < 0.5) {
      Alert.alert("Donation amount must be greater than $0.50");
    } else {
      if (!UserHelper.currentUserChurch?.person?.id) {
        donation.person = {
          id: "",
          email: email,
          name: firstName + " " + lastName,
        };
      }
      setShowPreviewModal(true);
    }
  };

  const handleCancel = () => {
    setDonationType("");
  };

  const loadData = async () => {
    var churchId: string = "";
    if (!UserHelper.currentUserChurch?.person?.id) churchId = UserHelper.currentUserChurch.church.id ?? "";
    else churchId = CacheHelper.church?.id || "";

    ApiHelper.get("/funds/churchId/" + churchId, "GivingApi").then((data) => {
      setFunds(data);
      if (data.length) setFundDonations([{ fundId: data[0].id }]);
    });
  };

  const handleFundDonationsChange = (fd: FundDonationInterface[]) => {
    setFundDonations(fd);
    let totalAmount = 0;
    let selectedFunds: any = [];
    for (const fundDonation of fd) {
      totalAmount += fundDonation.amount || 0;
      let fund = funds.find((fund: FundInterface) => fund.id === fundDonation.fundId);
      selectedFunds.push({ id: fundDonation.fundId, amount: fundDonation.amount || 0, name: fund?.name || "" });
    }
    let d = { ...donation };
    d.amount = totalAmount;
    d.funds = selectedFunds;
    setDonation(d);
    // setTotal(totalAmount);
    setTotal(calculateTotalWithFees(totalAmount, isChecked));
    setTransactionFee(getTransactionFee(totalAmount));
  };

  const makeDonation = async (message: string) => {
    const method = pm.find((pm) => pm.id === selectedMethod);
    if (!UserHelper.currentUserChurch?.person?.id) {
      ApiHelper.post("/users/loadOrCreate", { userEmail: email, firstName, lastName }, "MembershipApi")
        .catch(ex => {
          Alert.alert("Failed", ex.toString());
          return;
        })
        .then(async userData => {
          const personData = { churchId: CacheHelper.church!.id, firstName, lastName, email };
          const person = await ApiHelper.post("/people/loadOrCreate", personData, "MembershipApi")
          saveCard(userData, person)
        });
    } else {
      const payload: StripeDonationInterface = {
        ...donation,
        id: selectedMethod,
        customerId: customerId,
        type: method?.type,
        billing_cycle_anchor: +new Date(date),
        amount: parseFloat(total.toFixed(2)),
        church: {
          subDomain: CacheHelper.church?.subDomain
        }
      };
      saveDonation(payload, '');
    }
  };

  const saveCard = async (user: UserInterface, person: PersonInterface) => {
    const stripePaymentMethod = await createPaymentMethod({
      paymentMethodType: 'Card',
      ...cardDetails,
    });

    if (stripePaymentMethod.error) {
      Alert.alert("Failed", stripePaymentMethod.error.message);
      return;
    } else {
      const pm = { id: stripePaymentMethod.paymentMethod.id, personId: person.id, email: email, name: person.name.display, churchId: UserHelper.currentUserChurch.church.id }
      await ApiHelper.post("/paymentmethods/addcard", pm, "GivingApi").then(result => {
        if (result?.raw?.message) {
          Alert.alert("Failed", result.raw.message);
        } else {
          const d: { paymentMethod: StripePaymentMethod, customerId: string } = result;
          donation.person = {
            name: firstName + " " + lastName,
            id: person.id!,
            email: email,
          };
          const payload: StripeDonationInterface = {
            id: d.paymentMethod.id,
            customerId: d.customerId,
            type: d.paymentMethod?.type,
            amount: donation.amount,
            churchId: CacheHelper.church!.id,
            funds: donation.funds,
            person: donation.person,
          };
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
      setShowPreviewModal(false);
      setDonationType("");
      setTotal(0);
      setFundDonations([{ fundId: funds[0]?.id }]);
      setDonation(initDonation);
      setEmail('');
      setFirstName('');
      setLastName('')
      setToggleIcon('checkbox-passive')
      Alert.alert("Thank you for your donation.", message, [{ text: "OK", onPress: () => updatedFunction() }]);
    }
    if (results?.raw?.message) {
      setShowPreviewModal(false);
      Alert.alert("Failed to make a donation", results?.raw?.message);
    }
  }

  const handleIntervalChange = (key: string, value: any) => {
    const donationsCopy = { ...donation };
    switch (key) {
      case "number":
        if (donationsCopy.interval) donationsCopy.interval.interval_count = value;
        break;
      case "type":
        if (donationsCopy.interval) {
          switch (value) {
            case "one_week":
              donationsCopy.interval.interval_count = 1;
              donationsCopy.interval.interval = "week";
              break;
            case "two_week":
              donationsCopy.interval.interval_count = 2;
              donationsCopy.interval.interval = "week";
              break;
            case "one_month":
              donationsCopy.interval.interval_count = 1;
              donationsCopy.interval.interval = "month";
              break;
            case "three_month":
              donationsCopy.interval.interval_count = 3;
              donationsCopy.interval.interval = "month";
              break;
            case "one_year":
              donationsCopy.interval.interval_count = 1;
              donationsCopy.interval.interval = "year";
              break;
          }
        };
        break;
    }
    setDonation(donationsCopy);
  };

  const calculateTotalWithFees = (baseAmount: number, isChecked: boolean) => {
    const feeAmount = isChecked ? getTransactionFee(baseAmount) : 0;
    return baseAmount + feeAmount;
  };

  const getTransactionFee = (amount: number) => {
    const fixedFee = 0.30;
    const fixedPercent = 0.029;
    return Math.round(((amount + fixedFee) / (1 - fixedPercent) - amount) * 100) / 100;
  }

  const handleCheckboxPress = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    setToggleIcon(newCheckedState ? 'checkbox-active' : 'checkbox-passive');
    setTotal(calculateTotalWithFees(donation.amount || 0, newCheckedState));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setPaymentMethods(pm.map((p) => ({ label: `${p.name} ****${p.last4}`, value: p.id })));
  }, [pm]);

  return (
    <>
      <PreviewModal
        show={showPreviewModal}
        close={() => {
          setShowPreviewModal(false);
        }}
        donation={donation}
        paymentMethodName={paymentMethods?.filter((p) => p.value === selectedMethod)[0]?.label}
        donationType={donationType}
        handleDonate={makeDonation}
        isChecked={isChecked}
        transactionFee={transactionFee}
      />
      <InputBox
        title="Donate"
        headerIcon={<Image source={Constants.Images.ic_give} style={[globalStyles.donationIcon, { marginLeft: DimensionHelper.wp('4%') }]} />}
        saveFunction={donationType ? handleSave : undefined}
        cancelFunction={donationType ? handleCancel : undefined}
      >
        <ScrollView nestedScrollEnabled={true}>
          <View style={globalStyles.methodContainer}>
            <TouchableOpacity
              style={{
                ...globalStyles.methodButton,
                backgroundColor: donationType === "once" ? Constants.Colors.app_color : "white",
              }}
              onPress={() => setDonationType("once")}
            >
              <Text
                style={{ ...globalStyles.methodBtnText, color: donationType === "once" ? "white" : Constants.Colors.app_color }}
              >
                Make a Donation
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                ...globalStyles.methodButton,
                backgroundColor: donationType === "recurring" ? Constants.Colors.app_color : "white",
              }}
              onPress={() => {
                setDonationType("recurring")
                setDonation({ ...donation, interval: { interval_count: 1, interval: "week" } });
              }}
            >
              <Text
                style={{
                  ...globalStyles.methodBtnText,
                  color: donationType === "recurring" ? "white" : Constants.Colors.app_color,
                }}
              >
                Make a Recurring Donation
              </Text>
            </TouchableOpacity>
          </View>
          {donationType ? (
            <View>
              {!UserHelper.currentUserChurch?.person?.id ? (
                <View style={{ width: DimensionHelper.wp("100%") }}>
                  <View style={[globalStyles.donationInputFieldContainer, { width: DimensionHelper.wp('90%'), }]}>
                    <IconP name={'person'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={DimensionHelper.wp('4.5%')} />
                    <TextInput style={[globalStyles.textInputStyle, { width: DimensionHelper.wp('90%'), color: 'black' }]} placeholder={'First name'} autoCorrect={false} placeholderTextColor={'lightgray'} value={firstName} onChangeText={(text) => { setFirstName(text) }} />
                  </View>
                  <View style={[globalStyles.donationInputFieldContainer, { width: DimensionHelper.wp('90%') }]}>
                    <IconP name={'person'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={DimensionHelper.wp('4.5%')} />
                    <TextInput style={[globalStyles.textInputStyle, { width: DimensionHelper.wp('90%'), color: 'black' }]} placeholder={'Last name'} autoCorrect={false} placeholderTextColor={'lightgray'} value={lastName} onChangeText={(text) => { setLastName(text) }} />
                  </View>
                  <View style={[globalStyles.donationInputFieldContainer, { width: DimensionHelper.wp('90%') }]}>
                    <IconP name={'email'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={DimensionHelper.wp('4.5%')} />
                    <TextInput style={[globalStyles.textInputStyle, { width: DimensionHelper.wp('90%'), color: 'black' }]} placeholder={'Email'} autoCapitalize="none" autoCorrect={false} keyboardType='email-address' placeholderTextColor={'lightgray'} value={email} onChangeText={(text) => { setEmail(text) }} />
                  </View>
                </View>
              ) : null}
              <Text style={{ ...globalStyles.searchMainText, marginTop: DimensionHelper.wp("5.5%") }}>{UserHelper.currentUserChurch?.person?.id ? "Payment Method" : "Add Card"}</Text>
              {UserHelper.currentUserChurch?.person?.id ?
                <View style={{ width: DimensionHelper.wp("100%"), marginBottom: DimensionHelper.wp("12%") }}>
                  <DropDownPicker
                    listMode="SCROLLVIEW"
                    open={isMethodsDropdownOpen}
                    items={paymentMethods}
                    value={selectedMethod}
                    setOpen={setIsMethodsDropdownOpen}
                    setValue={setSelectedMethod}
                    setItems={setPaymentMethods}
                    containerStyle={{
                      ...globalStyles.containerStyle,
                      height: isMethodsDropdownOpen ? paymentMethods.length * DimensionHelper.wp("12%") : 0,
                    }}
                    style={globalStyles.dropDownMainStyle}
                    labelStyle={globalStyles.labelStyle}
                    listItemContainerStyle={globalStyles.itemStyle}
                    dropDownContainerStyle={globalStyles.dropDownStyle}
                    scrollViewProps={{ scrollEnabled: true }}
                    dropDownDirection="BOTTOM"
                  />
                </View>
                : <View style={[globalStyles.donationInputFieldContainer, { width: DimensionHelper.wp('90%'), padding: 10, marginTop: DimensionHelper.wp('3%') }]}>
                  <CardField
                    postalCodeEnabled={true}
                    placeholders={{ number: "4242 4242 4242 4242", cvc: "123" }}
                    cardStyle={{ backgroundColor: "#FFFFFF", textColor: "#000000" }}
                    style={{ width: "88%", height: 50, backgroundColor: "white" }}
                    onCardChange={(cardDetails) => {
                      setCardDetails(cardDetails);
                    }}
                  />
                </View>}
              {donationType === "once" ? null :
                <View>
                  <Text style={[globalStyles.searchMainText, { marginTop: DimensionHelper.wp("5.5%") }]}>
                    {donationType === "once" ? "Donation Date" : "Recurring Donation Start Date"}
                  </Text>
                  <View style={globalStyles.dateInput}>
                    <Text style={globalStyles.dateText} numberOfLines={1}>
                      {moment(date).format("DD-MM-YYYY")}
                    </Text>
                    <ModalDatePicker
                      button={<Icon name={"calendar-o"} style={globalStyles.selectionIcon} size={DimensionHelper.wp("6%")} />}
                      locale="en"
                      onSelect={(date: any) => {
                        setDate(date);
                        const donationsCopy = { ...donation };
                        donationsCopy.billing_cycle_anchor = date;
                        setDonation(donationsCopy);
                      }}
                      isHideOnSelect={true}
                      initialDate={new Date()}
                    />
                  </View>
                </View>}
              {donationType === "recurring" && (
                <View style={globalStyles.intervalView}>
                  {/* <View>
                    <Text style={globalStyles.semiTitleText}>Interval Number</Text>
                    <TextInput
                      style={globalStyles.intervalInput}
                      keyboardType="number-pad"
                      onChangeText={(text) => handleIntervalChange("number", text)}
                    />
                   
                  </View> */}
                  <View>
                    <Text style={globalStyles.semiTitleText}>Interval</Text>
                    <DropDownPicker
                      listMode="SCROLLVIEW"
                      open={isIntervalDropdownOpen}
                      items={intervalTypes}
                      value={selectedInterval}
                      setOpen={setIsIntervalDropdownOpen}
                      setValue={(value) => {
                        setSelectedInterval(value)
                        // handleIntervalChange("type", value)
                      }}
                      onChangeValue={(value) => {
                        handleIntervalChange("type", value)
                      }}
                      containerStyle={{
                        ...globalStyles.containerStyle,
                        height: isIntervalDropdownOpen ? intervalTypes.length * DimensionHelper.wp("12.5%") : DimensionHelper.wp('12%'),
                      }}
                      style={globalStyles.dropDownMainStyle}
                      labelStyle={globalStyles.labelStyle}
                      listItemContainerStyle={globalStyles.itemStyle}
                      dropDownContainerStyle={{ ...globalStyles.dropDownStyle }}
                      scrollViewProps={{ scrollEnabled: true }}
                      dropDownDirection="BOTTOM"
                    />
                  </View>
                </View>
              )}

              <Text style={globalStyles.semiTitleText}>Fund</Text>
              <FundDonations funds={funds} fundDonations={fundDonations} updatedFunction={handleFundDonationsChange} />
              {total >= 1 && (
                <View style={globalStyles.feesContainer}>
                  <IconP name={toggleIcon} color={Constants.Colors.app_color} style={globalStyles.checkBox} size={DimensionHelper.wp('4.5%')} onPress={handleCheckboxPress} />
                  <Text style={globalStyles.feesText}>
                    I'll generously add {CurrencyHelper.formatCurrency(transactionFee)} to cover the transaction fees so you can keep 100% of my donation.
                  </Text>
                </View>
              )}
              {/* {fundDonations.length > 1 && <Text style={globalStyles.totalText}>Total Donation Amount: {CurrencyHelper.formatCurrency(total)}</Text>} */}
              {total >= 1 && <Text style={globalStyles.totalText}>Total Donation Amount: {CurrencyHelper.formatCurrency(total)}</Text>}
              <Text style={globalStyles.semiTitleText}>Notes</Text>
              <TextInput
                multiline={true}
                numberOfLines={3}
                style={globalStyles.notesInput}
                value={donation.notes}
                onChangeText={(text) => {
                  const donationCopy = { ...donation };
                  donationCopy.notes = text;
                  setDonation(donationCopy);
                }}
              />
            </View>
          ) : null}
        </ScrollView>
      </InputBox >
    </>
  );
}

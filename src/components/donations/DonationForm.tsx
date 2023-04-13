import React, { useState, useEffect } from "react";
import { Image, ScrollView, View, TouchableOpacity, Text, Alert, TextInput, Dimensions, PixelRatio } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import DropDownPicker from "react-native-dropdown-picker";
import { ModalDatePicker } from "react-native-material-date-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import IconP from 'react-native-vector-icons/Fontisto';
import moment from "moment";
import { InputBox } from "../";
import { globalStyles, ApiHelper, UserHelper, Constants, UserInterface } from "../../helpers";
import { FundDonationInterface, FundInterface, StripePaymentMethod, StripeDonationInterface, PersonInterface, } from "../../interfaces";
import { FundDonations, } from ".";
import { PreviewModal } from "../";
import { CardField, CardFieldInput, createPaymentMethod } from "@stripe/stripe-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Props {
  paymentMethods: StripePaymentMethod[];
  customerId: string;
  updatedFunction: () => void;
}

export function DonationForm({ paymentMethods: pm, customerId, updatedFunction }: Props) {
  const person = UserHelper.currentUserChurch?.person;
  const [donationType, setDonationType] = useState<string>("");
  const [isMethodsDropdownOpen, setIsMethodsDropdownOpen] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const [funds, setFunds] = useState<FundInterface[]>([]);
  const [fundDonations, setFundDonations] = useState<FundDonationInterface[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ label: string; value: string }[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details>();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const initDonation: StripeDonationInterface = {
    id: pm[0]?.id,
    type: pm[0]?.type,
    customerId: customerId,
    person: {
      id: person?.id || "",
      email: person?.contactInfo?.email || "",
      name: person?.name?.display || "",
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

  const [dimension, setDimension] = useState(Dimensions.get('screen'));

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
  };

  useEffect(() => {
    Dimensions.addEventListener('change', () => {
      const dim = Dimensions.get('screen')
      setDimension(dim);
    })
  }, [dimension])

  const handleSave = () => {
    if (donation.amount && donation.amount < 0.5) {
      Alert.alert("Donation amount must be greater than $0.50");
    } else {
      if(!UserHelper.currentUserChurch?.person?.id){
        donation.person = {
          id: "",
          email : email,
          name : firstName + " " + lastName,
        };
      }
      setShowPreviewModal(true);
    }
  };

  const handleCancel = () => {
    setDonationType("");
  };

  const loadData = async () => {
    var churchId : string = ""; 
    if(!UserHelper.currentUserChurch?.person?.id){
      churchId = UserHelper.currentUserChurch.church.id ?? "";
    }else{
      const churchvalue = await AsyncStorage.getItem('CHURCH_DATA')
      if (churchvalue !== null) {
        const church = JSON.parse(churchvalue);
        console.log("CHURRRCHH -> ", church?.id);
        churchId = church.id ?? "";
      }
    }    
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
    setTotal(totalAmount);
  };

  const makeDonation = async (message: string) => {
    const method = pm.find((pm) => pm.id === selectedMethod);
    if(!UserHelper.currentUserChurch?.person?.id){
      ApiHelper.post("/users/loadOrCreate", { userEmail: email, firstName, lastName }, "MembershipApi")
        .catch(ex => { 
          Alert.alert("Failed", ex.toString());
          return;
         })
        .then(async userData => {
          const personData = { churchId: UserHelper.currentUserChurch.church.id, firstName, lastName, email };
          const person = await ApiHelper.post("/people/loadOrCreate", personData, "MembershipApi")
          saveCard(userData, person)
        });
    }else{
      const payload: StripeDonationInterface = {
        ...donation,
        id: selectedMethod,
        customerId: customerId,
        type: method?.type,
        billing_cycle_anchor: +new Date(date),
      };
      saveDonation(payload, '');
    }
  };

  const saveCard = async (user: UserInterface, person: PersonInterface) => {
    const stripePaymentMethod = await createPaymentMethod({
      paymentMethodType : 'Card',
      ...cardDetails,
    });

    console.log("The new card ----> ",stripePaymentMethod);
    
    if (stripePaymentMethod.error) {
      Alert.alert("Failed", stripePaymentMethod.error.message);
      return;
    }else{
      const pm = { id: stripePaymentMethod.paymentMethod.id, personId: person.id, email: email, name: person.name.display, churchId: UserHelper.currentUserChurch.church.id }
      await ApiHelper.post("/paymentmethods/addcard", pm, "GivingApi").then(result => {
        if (result?.raw?.message) {
          Alert.alert("Failed",result.raw.message);
        } else {
          const d: { paymentMethod: StripePaymentMethod, customerId: string } = result;
          donation.person = {
            name : firstName + " " + lastName,
            id: person.id!,
            email: email,
          };
          const payload: StripeDonationInterface = {
            id: d.paymentMethod.id,
            customerId: d.customerId,
            type: d.paymentMethod?.type,
            amount : donation.amount,
            churchId: UserHelper.currentUserChurch.church.id,
            funds: donation.funds,
            person : donation.person,
          };
          console.log("The current payload ---> ", payload);
          saveDonation(payload, "");
        }
      });
    }
  }

  const saveDonation = async (payload : StripeDonationInterface, message : string) => {
    let results;
    if (donationType === "once") results = await ApiHelper.post("/donate/charge/", payload, "GivingApi");
    if (donationType === "recurring") results = await ApiHelper.post("/donate/subscribe/", payload, "GivingApi");

    console.log("The results 00000> ", results);
    

    if (results?.status === "succeeded" || results?.status === "pending" || results?.status === "active") {
      setShowPreviewModal(false);
      setDonationType("");
      setTotal(0);
      setFundDonations([{ fundId: funds[0]?.id }]);
      setDonation(initDonation);
      setEmail('');
      setFirstName('');
      setLastName('')
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
      />
      <InputBox
        title="Donate"
        headerIcon={<Image source={Constants.Images.ic_give} style={[globalStyles.donationIcon, { marginLeft: wd('4%') }]} />}
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
              onPress={() => setDonationType("recurring")}
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
                <View style={{ width: wp("100%") }}>
                  <View style={[globalStyles.donationInputFieldContainer, {width: wd('90%'),}]}>
                    <IconP name={'person'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={wp('4.5%')} />
                    <TextInput style={[globalStyles.textInputStyle, { width: wd('90%'), color: 'black'}]} placeholder={'First name'} autoCorrect={false} placeholderTextColor={'lightgray'} value={firstName} onChangeText={(text) => { setFirstName(text) }} />
                  </View>
                  <View style={[globalStyles.donationInputFieldContainer, { width: wd('90%') }]}>
                    <IconP name={'person'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={wp('4.5%')} />
                    <TextInput style={[globalStyles.textInputStyle, { width: wd('90%'), color: 'black'}]} placeholder={'Last name'} autoCorrect={false} placeholderTextColor={'lightgray'} value={lastName} onChangeText={(text) => { setLastName(text) }} />
                  </View>
                  <View style={[globalStyles.donationInputFieldContainer, { width: wd('90%') }]}>
                    <IconP name={'email'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={wp('4.5%')} />
                    <TextInput style={[globalStyles.textInputStyle, { width: wd('90%'), color: 'black'}]} placeholder={'Email'} autoCapitalize="none" autoCorrect={false} keyboardType='email-address' placeholderTextColor={'lightgray'} value={email} onChangeText={(text) => { setEmail(text) }} />
                  </View>
                </View>
              ) : null}
              <Text style={{ ...globalStyles.searchMainText, marginTop: wp("5.5%") }}>{UserHelper.currentUserChurch?.person?.id ? "Payment Method" : "Add Card"}</Text>
              {UserHelper.currentUserChurch?.person?.id ? 
                <View style={{ width: wp("100%"), marginBottom: wp("12%") }}>
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
                      height: isMethodsDropdownOpen ? paymentMethods.length * wp("12%") : 0,
                    }}
                    style={globalStyles.dropDownMainStyle}
                    labelStyle={globalStyles.labelStyle}
                    listItemContainerStyle={globalStyles.itemStyle}
                    dropDownContainerStyle={globalStyles.dropDownStyle}
                    scrollViewProps={{ scrollEnabled: true }}
                    dropDownDirection="BOTTOM"
                  />
                </View>
              : <View style={[globalStyles.donationInputFieldContainer, { width: wd('90%'), padding:10, marginTop: wp('3%') }]}>
                  <CardField
                    postalCodeEnabled={true}
                    placeholders={{ number: "4242 4242 4242 4242", cvc : "123" }}
                    cardStyle={{ backgroundColor: "#FFFFFF", textColor: "#000000" }}
                    style={{ width: "88%", height: 50, backgroundColor: "white" }}
                    onCardChange={(cardDetails) => {
                      setCardDetails(cardDetails);
                    }}
                  />
                </View>}
                {donationType === "once" ? null : 
                <View>
                  <Text style={[globalStyles.searchMainText, {marginTop: wp("5.5%")}]}>
                    {donationType === "once" ? "Donation Date" : "Recurring Donation Start Date"}
                  </Text>
                  <View style={globalStyles.dateInput}>
                    <Text style={globalStyles.dateText} numberOfLines={1}>
                      {moment(date).format("DD-MM-YYYY")}
                    </Text>
                    <ModalDatePicker
                      button={<Icon name={"calendar-o"} style={globalStyles.selectionIcon} size={wp("6%")} />}
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
                        setSelectedInterval(value())
                        handleIntervalChange("type", value())
                      }}
                      containerStyle={{
                        ...globalStyles.containerStyle,
                        height: isIntervalDropdownOpen ? intervalTypes.length * wp("12.5%") : wp('12%'),
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
              {fundDonations.length > 1 && <Text style={globalStyles.totalText}>Total Donation Amount: ${total}</Text>}
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
      </InputBox>
    </>
  );
}

import React, { useState, useEffect } from "react";
import { Image, ScrollView, View, TouchableOpacity, Text } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import DropDownPicker from "react-native-dropdown-picker";
import { ModalDatePicker } from "react-native-material-date-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { InputBox } from ".";
import Images from "../utils/Images";
import Colors from "../utils/Colors";
import { globalStyles, ApiHelper } from "../helper";
import { FundDonationInterface, FundInterface, StripePaymentMethod } from "../interfaces";
import { FundDonations } from "."

interface Props {
  paymentMethods: StripePaymentMethod[];
}

export function DonationForm({ paymentMethods: pm }: Props) {
  const [donationType, setDonationType] = useState<string>("");
  const [isMethodsDropdownOpen, setIsMethodsDropdownOpen] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [date, setDate] = useState<string>("Select a date")
  const [funds, setFunds] = useState<FundInterface[]>([])
  const [fundDonations, setFundDonations] = useState<FundDonationInterface[]>([])
  const [paymentMethods, setPaymentMethods] = useState(
    pm.map((p) => ({ label: `${p.name} ****${p.last4}`, value: p.id }))
  );

  const handleSave = () => {};

  const handleCancel = () => {
    setDonationType("");
  };

  const loadData = () => {
    ApiHelper.get("/funds", "GivingApi").then(data => {
      setFunds(data)
      if (data.length) setFundDonations([{ fundId: data[0].id }])
    })
  }

  useEffect(loadData, [])

  return (
    <InputBox
      title="Donate"
      headerIcon={<Image source={Images.ic_give} style={globalStyles.donationIcon} />}
      saveFunction={donationType ? handleSave : undefined}
      cancelFunction={donationType ? handleCancel : undefined}
    >
      <ScrollView nestedScrollEnabled={true}>
        <View style={globalStyles.methodContainer}>
          <TouchableOpacity
            style={{
              ...globalStyles.methodButton,
              backgroundColor: donationType === "once" ? Colors.app_color : "white",
            }}
            onPress={() => setDonationType("once")}
          >
            <Text
              style={{ ...globalStyles.methodBtnText, color: donationType === "once" ? "white" : Colors.app_color }}
            >
              Make a Donation
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              ...globalStyles.methodButton,
              backgroundColor: donationType === "recurring" ? Colors.app_color : "white",
            }}
            onPress={() => setDonationType("recurring")}
          >
            <Text
              style={{
                ...globalStyles.methodBtnText,
                color: donationType === "recurring" ? "white" : Colors.app_color,
              }}
            >
              Make a Recurring Donation
            </Text>
          </TouchableOpacity>
        </View>
        {donationType ? (
          <View>
            <Text style={{ ...globalStyles.searchMainText, marginTop: wp("4%") }}>Payment Method</Text>
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
            <Text style={globalStyles.searchMainText}>{donationType === "once" ? "Donation Date" : "Recurring Donation Start Date"}</Text>
            <View style={globalStyles.dateInput}>
              <Text style={globalStyles.dateText} numberOfLines={1}>
                {date.toString()}
              </Text>
              <ModalDatePicker
                button={<Icon name={"calendar-o"} style={globalStyles.selectionIcon} size={wp("6%")} />}
                locale="en"
                onSelect={(date: any) => console.log(date)}
                isHideOnSelect={true}
                initialDate={new Date()}
              />
            </View>
            <Text style={globalStyles.semiTitleText}>Fund</Text>
            <FundDonations funds={funds} fundDonations={fundDonations} />
          </View>
        ) : null}
      </ScrollView>
    </InputBox>
  );
}

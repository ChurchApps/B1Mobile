import React from "react";
import { Text, View, TextInput } from "react-native";
import { globalStyles } from "../helper";
import { FundDonationInterface, FundInterface } from "../interfaces";

interface Props {
  fundDonation: FundDonationInterface;
  funds: FundInterface[];
  index: number;
}

export function FundDonation({ fundDonation, funds, index }: Props) {
  return (
    <View style={globalStyles.fundView} key={index}>
      <View>
        <Text style={globalStyles.semiTitleText}>Amount</Text>
        <TextInput style={globalStyles.fundInput} keyboardType="number-pad" />
      </View>
      <View>
        <Text style={globalStyles.semiTitleText}>Fund</Text>
        <View>{/* <FundDropDown fundList={intervalList} setFundList={setIntervalList} type={"funds"} /> */}</View>
      </View>
    </View>
  );
}

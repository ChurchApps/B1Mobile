import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { FundDonationInterface, FundInterface } from "../interfaces";
import { globalStyles } from "../helper";
import { FundDonation } from ".";

interface Props {
  funds: FundInterface[];
  fundDonations: FundDonationInterface[];
}

export function FundDonations({ funds, fundDonations }: Props) {
  return (
    <>
      {fundDonations.map((fd, index) => (
        <FundDonation fundDonation={fd} funds={funds} index={index} />
      ))}
      <TouchableOpacity onPress={() => console.log("add more clicked")}>
        <Text style={globalStyles.addMoreText}>Add more</Text>
      </TouchableOpacity>
    </>
  );
}

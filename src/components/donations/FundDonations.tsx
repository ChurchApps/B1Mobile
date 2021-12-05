import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { FundDonationInterface, FundInterface } from "../../interfaces";
import { globalStyles } from "../../helpers";
import { FundDonation } from ".";

interface Props {
  funds: FundInterface[];
  fundDonations: FundDonationInterface[];
  updatedFunction: (fundDonations: FundDonationInterface[]) => void;
}

export function FundDonations({ funds, fundDonations, updatedFunction }: Props) {
  const handleUpdated = (fundDonation: FundDonationInterface, index: number) => {
    let fdDonations = [...fundDonations];
    fdDonations[index] = fundDonation;
    updatedFunction(fdDonations);
  };

  const addRow = () => {
    let fDonations = [...fundDonations];
    let fd = { fundId: funds[0].id } as FundDonationInterface;
    fDonations.push(fd);
    updatedFunction(fDonations);
  }

  return (
    <>
      {fundDonations.map((fd, index) => (
        <FundDonation fundDonation={fd} funds={funds} updatedFunction={handleUpdated} index={index} />
      ))}
      <TouchableOpacity onPress={() => addRow()}>
        <Text style={globalStyles.addMoreText}>Add more</Text>
      </TouchableOpacity>
    </>
  );
}

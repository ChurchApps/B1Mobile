import { globalStyles } from "@/src/helpers";
import { FundDonationInterface, FundInterface } from "@/src/interfaces";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { FundDonation } from "./FundDonation";

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
      {fundDonations?.map((fd, index) => (
        <FundDonation
          key={`fund-donation-${fd.fundId || index}`}
          fundDonation={fd}
          funds={funds}
          updatedFunction={handleUpdated}
          index={index}
        />
      ))}
      <TouchableOpacity onPress={() => addRow()}>
        <Text style={globalStyles.addMoreText}>Add more</Text>
      </TouchableOpacity>
    </>
  );
}

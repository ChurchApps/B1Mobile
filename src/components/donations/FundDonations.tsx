import { FundDonationInterface, FundInterface } from "@/src/interfaces";
import React from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useAppTheme } from "@/src/theme";
import { FundDonation } from "./FundDonation";

interface Props {
  funds: FundInterface[];
  fundDonations: FundDonationInterface[];
  updatedFunction: (fundDonations: FundDonationInterface[]) => void;
}

export function FundDonations({ funds, fundDonations, updatedFunction }: Props) {
  const { spacing } = useAppTheme();

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
  };

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text variant="titleMedium" style={{ marginBottom: spacing.sm }}>
        Fund
      </Text>
      {fundDonations?.map((fd, index) => <FundDonation key={`fund-donation-${fd.fundId || index}`} fundDonation={fd} funds={funds} updatedFunction={handleUpdated} index={index} />)}
      <Button mode="text" onPress={addRow} style={{ marginTop: spacing.xs }}>
        Add more
      </Button>
    </View>
  );
}

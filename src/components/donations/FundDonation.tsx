import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Menu, Text, TextInput, useTheme } from "react-native-paper";
import { useAppTheme } from "@/src/theme";
import { FundDonationInterface, FundInterface } from "@/src/interfaces";
import { CurrencyHelper } from "@/src/helpers";

interface Props {
  fundDonation: FundDonationInterface;
  funds: FundInterface[];
  index: number;
  updatedFunction: (fundDonation: FundDonationInterface, index: number) => void;
}

export function FundDonation({ fundDonation, funds, index, updatedFunction }: Props) {
  const { spacing } = useAppTheme();
  const theme = useTheme();
  const [showFundMenu, setShowFundMenu] = useState(false);
  const [selectedFund, setSelectedFund] = useState<string>(funds[0]?.id || "");

  const handleAmountChange = (text: string) => {
    let fd = { ...fundDonation };
    fd.amount = parseFloat(text.replace(/[^0-9.]/g, ""));
    updatedFunction(fd, index);
  };

  useEffect(() => {
    let fd = { ...fundDonation };
    fd.fundId = selectedFund;
    updatedFunction(fd, index);
  }, [selectedFund]);

  const getFundName = (fundId: string) => funds.find(f => f.id === fundId)?.name || "Select Fund";

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm }}>
      <View style={{ flex: 1, marginRight: spacing.sm }}>
        <Text variant="bodyMedium" style={{ marginBottom: spacing.xs }}>
          Amount
        </Text>
        <TextInput
          mode="outlined"
          keyboardType="numeric"
          value={fundDonation.amount ? CurrencyHelper.formatCurrency(fundDonation.amount) : ""}
          onChangeText={handleAmountChange}
          style={{ backgroundColor: theme.colors.surface }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" style={{ marginBottom: spacing.xs }}>
          Fund
        </Text>
        <Menu
          visible={showFundMenu}
          onDismiss={() => setShowFundMenu(false)}
          anchor={
            <TextInput
              mode="outlined"
              value={getFundName(selectedFund)}
              onPressIn={() => setShowFundMenu(true)}
              right={<TextInput.Icon icon="chevron-down" />}
              style={{ backgroundColor: theme.colors.surface }}
              editable={false}
            />
          }>
          {funds.map(fund => (
            <Menu.Item
              key={fund.id}
              onPress={() => {
                setSelectedFund(fund.id);
                setShowFundMenu(false);
              }}
              title={fund.name}
            />
          ))}
        </Menu>
      </View>
    </View>
  );
}

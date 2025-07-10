import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View } from "react-native";
import { Menu, Text, TextInput, useTheme } from "react-native-paper";
import { useAppTheme } from "../../../src/theme";
import { FundDonationInterface, FundInterface } from "../../../src/interfaces";
import { CurrencyHelper } from "../../../src/helpers";

interface Props {
  fundDonation: FundDonationInterface;
  funds: FundInterface[];
  index: number;
  updatedFunction: (fundDonation: FundDonationInterface, index: number) => void;
}

export const FundDonation = React.memo(({ fundDonation, funds, index, updatedFunction }: Props) => {
  const { spacing } = useAppTheme();
  const theme = useTheme();
  const [showFundMenu, setShowFundMenu] = useState(false);
  const [selectedFund, setSelectedFund] = useState<string>(funds[0]?.id || "");

  const handleAmountChange = useCallback(
    (text: string) => {
      let fd = { ...fundDonation };
      fd.amount = parseFloat(text.replace(/[^0-9.]/g, ""));
      updatedFunction(fd, index);
    },
    [fundDonation, index, updatedFunction]
  );

  useEffect(() => {
    let fd = { ...fundDonation };
    fd.fundId = selectedFund;
    updatedFunction(fd, index);
  }, [selectedFund, fundDonation, index, updatedFunction]);

  const getFundName = useMemo(() => (fundId: string) => funds.find(f => f.id === fundId)?.name || "Select Fund", [funds]);

  const formattedAmount = useMemo(() => (fundDonation.amount ? CurrencyHelper.formatCurrency(fundDonation.amount) : ""), [fundDonation.amount]);

  const handleFundMenuPress = useCallback(() => {
    setShowFundMenu(true);
  }, []);

  const handleFundMenuDismiss = useCallback(() => {
    setShowFundMenu(false);
  }, []);

  const handleFundSelect = useCallback((fundId: string) => {
    setSelectedFund(fundId);
    setShowFundMenu(false);
  }, []);

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm }}>
      <View style={{ flex: 1, marginRight: spacing.sm }}>
        <Text variant="bodyMedium" style={{ marginBottom: spacing.xs }}>
          Amount
        </Text>
        <TextInput mode="outlined" keyboardType="numeric" value={formattedAmount} onChangeText={handleAmountChange} style={{ backgroundColor: theme.colors.surface }} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" style={{ marginBottom: spacing.xs }}>
          Fund
        </Text>
        <Menu visible={showFundMenu} onDismiss={handleFundMenuDismiss} anchor={<TextInput mode="outlined" value={getFundName(selectedFund)} onPressIn={handleFundMenuPress} right={<TextInput.Icon icon="chevron-down" />} style={{ backgroundColor: theme.colors.surface }} editable={false} />}>
          {funds.map(fund => (
            <Menu.Item key={fund.id} onPress={() => handleFundSelect(fund.id)} title={fund.name} />
          ))}
        </Menu>
      </View>
    </View>
  );
});

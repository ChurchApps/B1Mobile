import React, { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { Button, Divider, IconButton, Modal, Portal, Surface, Text, useTheme } from "react-native-paper";
import { useAppTheme } from "../../../src/theme";
import { CurrencyHelper, DateHelper } from "../../../src/helpers";
import { StripeDonationInterface } from "../../../src/interfaces";

interface Props {
  show: boolean;
  close: () => void;
  donation: StripeDonationInterface;
  paymentMethodName: string;
  donationType: string;
  handleDonate: (message: string) => void;
  isChecked: boolean;
  transactionFee: number;
}

export function PreviewModal({ show, close, donation, paymentMethodName, donationType: d, handleDonate, isChecked, transactionFee }: Props) {
  const { theme: appTheme, spacing } = useAppTheme();
  const theme = useTheme();
  const donationType: any = { once: "One-time Donation", recurring: "Recurring Donation" };
  const [isLoading, setLoading] = React.useState<boolean>(false);

  const handleClick = async () => {
    setLoading(true);
    let message = "Thank you for your donation.";
    if (d === "recurring") message = "Recurring donation created. " + message;
    await handleDonate(message);
    setLoading(false);
  };

  const formatInterval = () => {
    const count = donation.interval?.interval_count;
    const interval = donation.interval?.interval;
    let result = `${count} ${interval}`;
    return count && count > 1 ? result + "s" : result;
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <Portal>
      <Modal visible={show} onDismiss={close} contentContainerStyle={{ margin: spacing.lg, backgroundColor: theme.colors.surface, borderRadius: appTheme.roundness, padding: spacing.lg }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
          <Text variant="titleLarge">Donation Preview</Text>
          <IconButton icon="close" onPress={close} />
        </View>
        <ScrollView style={{ maxHeight: "70%" }}>
          <Surface style={{ padding: spacing.md, borderRadius: appTheme.roundness, backgroundColor: theme.colors.surfaceVariant }}>
            <View style={{ marginBottom: spacing.sm }}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Name
              </Text>
              <Text variant="bodyLarge">{donation?.person?.name}</Text>
            </View>
            <Divider style={{ marginVertical: spacing.sm }} />
            <View style={{ marginBottom: spacing.sm }}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Payment Method
              </Text>
              <Text variant="bodyLarge">{paymentMethodName || "Card"}</Text>
            </View>
            <Divider style={{ marginVertical: spacing.sm }} />
            <View style={{ marginBottom: spacing.sm }}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Type
              </Text>
              <Text variant="bodyLarge">{donationType[d]}</Text>
            </View>
            <Divider style={{ marginVertical: spacing.sm }} />
            {d === "once" && (
              <>
                <View style={{ marginBottom: spacing.sm }}>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Donation Date
                  </Text>
                  <Text variant="bodyLarge">{DateHelper.formatHtml5Date(new Date(donation.billing_cycle_anchor || ""))}</Text>
                </View>
                <Divider style={{ marginVertical: spacing.sm }} />
              </>
            )}
            {donation.notes && (
              <>
                <View style={{ marginBottom: spacing.sm }}>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Notes
                  </Text>
                  <Text variant="bodyLarge">{donation.notes}</Text>
                </View>
                <Divider style={{ marginVertical: spacing.sm }} />
              </>
            )}
            {d === "recurring" && (
              <>
                <View style={{ marginBottom: spacing.sm }}>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Starting On
                  </Text>
                  <Text variant="bodyLarge">{DateHelper.formatHtml5Date(new Date(donation.billing_cycle_anchor || ""))}</Text>
                </View>
                <Divider style={{ marginVertical: spacing.sm }} />
                <View style={{ marginBottom: spacing.sm }}>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Recurring Every
                  </Text>
                  <Text variant="bodyLarge">{formatInterval()}</Text>
                </View>
                <Divider style={{ marginVertical: spacing.sm }} />
              </>
            )}
            <View style={{ marginBottom: spacing.sm }}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Funds
              </Text>
              {donation.funds?.map(fund => (
                <Text key={`fund-${fund.id || fund.name?.toLowerCase().replace(/\s+/g, "-") || "unnamed"}`} variant="bodyLarge">
                  {CurrencyHelper.formatCurrency(fund.amount)} - {fund.name || "Unnamed Fund"}
                </Text>
              ))}
            </View>
            <Divider style={{ marginVertical: spacing.sm }} />
            {isChecked && (
              <>
                <View style={{ marginBottom: spacing.sm }}>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Transaction Fee
                  </Text>
                  <Text variant="bodyLarge">{CurrencyHelper.formatCurrency(transactionFee)}</Text>
                </View>
                <Divider style={{ marginVertical: spacing.sm }} />
              </>
            )}
            <View style={{ marginBottom: spacing.sm }}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Total
              </Text>
              <Text variant="bodyLarge">{isChecked ? CurrencyHelper.formatCurrency((donation.amount || 0) + transactionFee) : CurrencyHelper.formatCurrency(donation.amount || 0)}</Text>
            </View>
          </Surface>
        </ScrollView>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md }}>
          <Button mode="outlined" onPress={close} style={{ flex: 1, marginRight: spacing.sm }}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleClick} loading={isLoading} style={{ flex: 1, marginLeft: spacing.sm }}>
            Donate
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

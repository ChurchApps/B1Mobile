import React from "react";
import { StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { PaymentMethods } from "../LazyDonationComponents";
import { StripePaymentMethod } from "../../../interfaces";
import { UserInterface } from "../../../interfaces";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../../theme";

interface ManagePaymentsProps {
  person: UserInterface | undefined;
  customerId: string;
  paymentMethods: StripePaymentMethod[];
  isLoading: boolean;
  publishKey: string;
  loadData: () => Promise<void>;
}

export const ManagePayments: React.FC<ManagePaymentsProps> = ({
  person,
  customerId,
  paymentMethods,
  isLoading,
  publishKey,
  loadData
}) => {
  const { t } = useTranslation();
  const colors = useThemeColors();

  if (!person?.id) {
    return (
      <Card style={[styles.loginPromptCard, { shadowColor: colors.shadowBlack }]}>
        <Card.Content style={styles.loginPromptContent}>
          <MaterialIcons name="login" size={48} color={colors.disabled} style={styles.loginPromptIcon} />
          <Text variant="titleMedium" style={[styles.loginPromptTitle, { color: colors.text }]}>
            {t("auth.signIn")}
          </Text>
          <Text variant="bodyMedium" style={[styles.loginPromptSubtitle, { color: colors.disabled }]}>
            {t("donations.manage")}
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <PaymentMethods
      customerId={customerId}
      paymentMethods={paymentMethods}
      updatedFunction={loadData}
      isLoading={isLoading}
      publishKey={publishKey}
    />
  );
};

const styles = StyleSheet.create({
  loginPromptCard: {
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  loginPromptContent: {
    alignItems: "center",
    padding: 32
  },
  loginPromptIcon: { marginBottom: 16 },
  loginPromptTitle: {
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8
  },
  loginPromptSubtitle: {
    textAlign: "center",
    lineHeight: 20
  }
});

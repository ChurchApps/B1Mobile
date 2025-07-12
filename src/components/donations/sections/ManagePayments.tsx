import React from "react";
import { StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { PaymentMethods } from "../LazyDonationComponents";
import { StripePaymentMethod } from "../../../interfaces";
import { UserInterface } from "../../../interfaces";

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
  if (!person?.id) {
    return (
      <Card style={styles.loginPromptCard}>
        <Card.Content style={styles.loginPromptContent}>
          <MaterialIcons name="login" size={48} color="#9E9E9E" style={styles.loginPromptIcon} />
          <Text variant="titleMedium" style={styles.loginPromptTitle}>
            Please login to manage payment methods
          </Text>
          <Text variant="bodyMedium" style={styles.loginPromptSubtitle}>
            Save your payment information for faster, more convenient giving.
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  loginPromptContent: {
    alignItems: "center",
    padding: 32
  },
  loginPromptIcon: {
    marginBottom: 16
  },
  loginPromptTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8
  },
  loginPromptSubtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  }
});
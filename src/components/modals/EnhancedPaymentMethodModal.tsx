import React from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Card, Text, Button, Modal, Portal } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { StripePaymentMethod } from "../../interfaces";

interface Props {
  show: boolean;
  close: () => void;
  onSelect: (paymentMethod: StripePaymentMethod) => void;
}

const paymentMethods = [
  {
    type: "card",
    title: "Credit or Debit Card",
    subtitle: "Visa, Mastercard, American Express",
    icon: "credit-card",
    color: "#1565C0"
  },
  {
    type: "bank",
    title: "Bank Account",
    subtitle: "Direct bank transfer (ACH)",
    icon: "account-balance",
    color: "#70DC87"
  }
];

export function EnhancedPaymentMethodModal({ show, close, onSelect }: Props) {
  const handleSelect = (type: string) => {
    onSelect(new StripePaymentMethod({ type }));
    close();
  };

  return (
    <Portal>
      <Modal visible={show} onDismiss={close} contentContainerStyle={styles.modalContainer}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                Add Payment Method
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={close}>
                <MaterialIcons name="close" size={24} color="#9E9E9E" />
              </TouchableOpacity>
            </View>

            <Text variant="bodyMedium" style={styles.subtitle}>
              Choose how you'd like to give. Both options are secure and encrypted.
            </Text>

            {/* Payment Method Options */}
            <View style={styles.methodsContainer}>
              {paymentMethods.map(method => (
                <TouchableOpacity key={method.type} style={styles.methodCard} onPress={() => handleSelect(method.type)} activeOpacity={0.7}>
                  <View style={[styles.iconContainer, { backgroundColor: `${method.color}15` }]}>
                    <MaterialIcons name={method.icon as any} size={28} color={method.color} />
                  </View>

                  <View style={styles.methodContent}>
                    <Text variant="titleMedium" style={styles.methodTitle}>
                      {method.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.methodSubtitle}>
                      {method.subtitle}
                    </Text>
                  </View>

                  <MaterialIcons name="arrow-forward-ios" size={16} color="#9E9E9E" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <MaterialIcons name="security" size={20} color="#70DC87" />
              <Text variant="bodySmall" style={styles.securityText}>
                Your payment information is encrypted and secure
              </Text>
            </View>

            {/* Cancel Button */}
            <Button mode="outlined" onPress={close} style={styles.cancelButton} labelStyle={styles.cancelButtonText}>
              Cancel
            </Button>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20
  },
  card: {
    width: Math.min(screenWidth - 40, 400),
    maxHeight: screenHeight * 0.8,
    borderRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    backgroundColor: "#FFFFFF"
  },
  cardContent: {
    padding: 0
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8
  },
  headerTitle: {
    color: "#3c3c3c",
    fontWeight: "700"
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F6F6F8",
    justifyContent: "center",
    alignItems: "center"
  },
  subtitle: {
    color: "#9E9E9E",
    paddingHorizontal: 24,
    marginBottom: 24,
    lineHeight: 20
  },

  // Methods
  methodsContainer: {
    paddingHorizontal: 24,
    gap: 12
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#F6F6F8",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent"
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  methodContent: {
    flex: 1
  },
  methodTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 2
  },
  methodSubtitle: {
    color: "#9E9E9E",
    lineHeight: 16
  },

  // Security Notice
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 8
  },
  securityText: {
    color: "#70DC87",
    fontWeight: "500"
  },

  // Cancel Button
  cancelButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderColor: "#E0E0E0"
  },
  cancelButtonText: {
    color: "#9E9E9E",
    fontWeight: "600"
  }
});

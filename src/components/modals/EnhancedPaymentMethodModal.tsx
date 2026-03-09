import React from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Card, Text, Button, Modal, Portal } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StripePaymentMethod } from "../../interfaces";
import { useThemeColors } from "../../theme";

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
    colorKey: "primary" as const
  },
  {
    type: "bank",
    title: "Bank Account",
    subtitle: "Direct bank transfer (ACH)",
    icon: "account-balance",
    colorKey: "success" as const
  }
];

export function EnhancedPaymentMethodModal({ show, close, onSelect }: Props) {
  const colors = useThemeColors();

  const handleSelect = (type: string) => {
    onSelect(new StripePaymentMethod({ type }));
    close();
  };

  return (
    <Portal>
      <Modal visible={show} onDismiss={close} contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.modalOverlay }]}>
        <Card style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadowBlack }]}>
          <Card.Content style={styles.cardContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text variant="headlineSmall" style={[styles.headerTitle, { color: colors.text }]}>
                Add Payment Method
              </Text>
              <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.iconBackground }]} onPress={close}>
                <MaterialIcons name="close" size={24} color={colors.iconColor} />
              </TouchableOpacity>
            </View>

            <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.disabled }]}>
              Choose how you'd like to give. Both options are secure and encrypted.
            </Text>

            {/* Payment Method Options */}
            <View style={styles.methodsContainer}>
              {paymentMethods.map(method => {
                const methodColor = colors[method.colorKey];
                return (
                  <TouchableOpacity key={method.type} style={[styles.methodCard, { backgroundColor: colors.iconBackground }]} onPress={() => handleSelect(method.type)} activeOpacity={0.7}>
                    <View style={[styles.iconContainer, { backgroundColor: `${methodColor}15` }]}>
                      <MaterialIcons name={method.icon as any} size={28} color={methodColor} />
                    </View>

                    <View style={styles.methodContent}>
                      <Text variant="titleMedium" style={[styles.methodTitle, { color: colors.text }]}>
                        {method.title}
                      </Text>
                      <Text variant="bodySmall" style={[styles.methodSubtitle, { color: colors.disabled }]}>
                        {method.subtitle}
                      </Text>
                    </View>

                    <MaterialIcons name="arrow-forward-ios" size={16} color={colors.iconColor} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <MaterialIcons name="security" size={20} color={colors.success} />
              <Text variant="bodySmall" style={[styles.securityText, { color: colors.success }]}>
                Your payment information is encrypted and secure
              </Text>
            </View>

            {/* Cancel Button */}
            <Button mode="outlined" onPress={close} style={[styles.cancelButton, { borderColor: colors.divider }]} labelStyle={[styles.cancelButtonText, { color: colors.disabled }]}>
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
    padding: 20
  },
  card: {
    width: Math.min(screenWidth - 40, 400),
    maxHeight: screenHeight * 0.8,
    borderRadius: 24,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12
  },
  cardContent: { padding: 0 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8
  },
  headerTitle: { fontWeight: "700" },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center"
  },
  subtitle: {
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
  methodContent: { flex: 1 },
  methodTitle: {
    fontWeight: "600",
    marginBottom: 2
  },
  methodSubtitle: { lineHeight: 16 },

  // Security Notice
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 8
  },
  securityText: { fontWeight: "500" },

  // Cancel Button
  cancelButton: {
    marginHorizontal: 24,
    marginBottom: 24
  },
  cancelButtonText: { fontWeight: "600" }
});

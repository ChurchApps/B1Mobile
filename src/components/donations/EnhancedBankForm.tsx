import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { Card, Text, TextInput, Button, Menu, Switch, Banner, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { ApiHelper } from "../../helpers";
import { PaymentMethodInterface, StripeBankAccountUpdateInterface, StripeBankAccountVerifyInterface, StripePaymentMethod } from "../../interfaces";
import { useStripe } from "@stripe/stripe-react-native";
import { useCurrentUserChurch } from "../../stores/useUserStore";

interface Props {
  setMode: (mode: string) => void;
  bank: StripePaymentMethod;
  customerId: string;
  updatedFunction: () => void;
  handleDelete: () => void;
  showVerifyForm: boolean;
}

const accountTypes = [
  { label: "Individual", value: "individual" },
  { label: "Company", value: "company" }
];

export function EnhancedBankForm({ bank, customerId, setMode, updatedFunction, handleDelete, showVerifyForm }: Props) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAccountTypeMenu, setShowAccountTypeMenu] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState(bank.account_holder_type || accountTypes[0].value);
  const [name, setName] = useState<string>(bank.account_holder_name || "");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [routingNumber, setRoutingNumber] = useState<string>("");
  const [firstDeposit, setFirstDeposit] = useState<string>("");
  const [secondDeposit, setSecondDeposit] = useState<string>("");
  const [saveForFuture, setSaveForFuture] = useState<boolean>(true);
  const [showBankDetails, setShowBankDetails] = useState<boolean>(false);

  const currentUserChurch = useCurrentUserChurch();
  const person = currentUserChurch?.person;
  const { createToken } = useStripe();

  // Input validation functions
  const validateRoutingNumber = (routing: string): boolean => /^\\d{9}$/.test(routing);
  const validateAccountNumber = (account: string): boolean => /^\\d{4,17}$/.test(account);

  // Format routing number with visual grouping
  const formatRoutingNumber = (value: string): string => {
    const cleanValue = value.replace(/\\D/g, "");
    if (cleanValue.length <= 9) {
      return cleanValue.replace(/(\\d{3})(\\d{3})(\\d{0,3})/, (match, p1, p2, p3) => {
        if (p3) return `${p1}-${p2}-${p3}`;
        if (p2) return `${p1}-${p2}`;
        return p1;
      });
    }
    return cleanValue.slice(0, 9);
  };

  const handleRoutingNumberChange = (text: string): void => {
    const cleaned = text.replace(/\\D/g, "");
    setRoutingNumber(cleaned);
  };

  const handleAccountNumberChange = (text: string): void => {
    const cleaned = text.replace(/\\D/g, "");
    if (cleaned.length <= 17) {
      setAccountNumber(cleaned);
    }
  };

  const getAccountTypeLabel = (value: string) => accountTypes.find(type => type.value === value)?.label || "Individual";

  const handleSave = () => {
    setIsSubmitting(true);
    if (showVerifyForm) {
      verifyBank();
      return;
    }
    if (bank.id) {
      updateBank();
      return;
    }
    createBank();
  };

  const updateBank = async () => {
    if (!name.trim()) {
      setIsSubmitting(false);
      Alert.alert("Required Field", "Please enter the account holder name");
      return;
    }

    const payload: StripeBankAccountUpdateInterface = {
      paymentMethodId: bank.id,
      customerId,
      personId: person?.id || "",
      bankData: {
        account_holder_name: name,
        account_holder_type: selectedType
      }
    };

    try {
      const response = await ApiHelper.post("/paymentmethods/updatebank", payload, "GivingApi");
      if (response?.raw?.message) {
        Alert.alert("Error", response.raw.message);
      } else {
        Alert.alert("Success", "Bank account updated successfully");
        setMode("display");
        await updatedFunction();
      }
    } catch {
      Alert.alert("Error", "Failed to update bank account");
    }

    setIsSubmitting(false);
  };

  const createBank = async () => {
    if (!routingNumber || !accountNumber || !name.trim()) {
      setIsSubmitting(false);
      Alert.alert("Required Fields", "Please fill in all required fields");
      return;
    }

    if (!validateRoutingNumber(routingNumber)) {
      setIsSubmitting(false);
      Alert.alert("Invalid Routing Number", "Please enter a valid 9-digit routing number");
      return;
    }

    if (!validateAccountNumber(accountNumber)) {
      setIsSubmitting(false);
      Alert.alert("Invalid Account Number", "Please enter a valid account number (4-17 digits)");
      return;
    }

    try {
      const tokenResult = await createToken({
        type: "BankAccount",
        bankAccount: {
          routingNumber: routingNumber,
          accountNumber: accountNumber,
          accountHolderType: selectedType as "Individual" | "Company",
          accountHolderName: name,
          country: "US",
          currency: "usd"
        }
      });

      if (tokenResult.error) {
        Alert.alert("Error", tokenResult.error.message);
        setIsSubmitting(false);
        return;
      }

      const paymentMethod: PaymentMethodInterface = {
        id: tokenResult.token.id,
        customerId,
        personId: person?.id || "",
        email: person?.contactInfo?.email || "",
        name: person?.name?.display || ""
      };

      const result = await ApiHelper.post("/paymentmethods/addbankaccount", paymentMethod, "GivingApi");
      if (result?.raw?.message) {
        Alert.alert("Error", result.raw.message);
      } else {
        Alert.alert("Success", "Bank account added successfully! You'll receive verification deposits in 1-3 business days.");
        setMode("display");
        await updatedFunction();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create bank account");
    }

    setIsSubmitting(false);
  };

  const verifyBank = async () => {
    if (!firstDeposit || !secondDeposit) {
      setIsSubmitting(false);
      Alert.alert("Required", "Please enter both deposit amounts");
      return;
    }

    const verifyPayload: StripeBankAccountVerifyInterface = {
      paymentMethodId: bank.id,
      customerId,
      amountData: { amounts: [firstDeposit, secondDeposit] }
    };

    try {
      const response = await ApiHelper.post("/paymentmethods/verifyBank", verifyPayload, "GivingApi");
      if (response?.raw?.message) {
        Alert.alert("Error", response.raw.message);
      } else {
        Alert.alert("Success", "Bank account verified successfully!");
        setMode("display");
        await updatedFunction();
      }
    } catch {
      Alert.alert("Error", "Failed to verify bank account");
    }

    setIsSubmitting(false);
  };

  const isEditing = !!bank.id;
  const title = isEditing ? `${bank.name?.toUpperCase()} ****${bank.last4}` : "Add Bank Account";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode("display")}>
          <MaterialIcons name="arrow-back" size={24} color="#3c3c3c" />
        </TouchableOpacity>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {showVerifyForm ? (
        <>
          {/* Verification Instructions */}
          <Card style={styles.instructionsCard}>
            <Card.Content>
              <View style={styles.instructionsHeader}>
                <MaterialIcons name="verified-user" size={48} color="#1565C0" />
                <Text variant="titleLarge" style={styles.instructionsTitle}>
                  Verify Your Account
                </Text>
              </View>
              <Text variant="bodyLarge" style={styles.instructionsText}>
                Enter the two small deposit amounts you received in your bank account to complete verification.
              </Text>
            </Card.Content>
          </Card>

          {/* Verification Form */}
          <Card style={styles.formCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Deposit Amounts
              </Text>

              <View style={styles.depositRow}>
                <View style={styles.depositField}>
                  <TextInput mode="outlined" label="First Deposit" value={firstDeposit} onChangeText={setFirstDeposit} keyboardType="decimal-pad" style={styles.depositInput} left={<TextInput.Icon icon={() => <Text style={styles.dollarSign}>$</Text>} />} />
                </View>
                <View style={styles.depositField}>
                  <TextInput mode="outlined" label="Second Deposit" value={secondDeposit} onChangeText={setSecondDeposit} keyboardType="decimal-pad" style={styles.depositInput} left={<TextInput.Icon icon={() => <Text style={styles.dollarSign}>$</Text>} />} />
                </View>
              </View>
            </Card.Content>
          </Card>
        </>
      ) : (
        <>
          {/* Information Banner */}
          {!isEditing && (
            <Banner visible={true} icon={({ size }) => <MaterialIcons name="info" size={size} color="#1565C0" />} style={styles.infoBanner}>
              <Text variant="bodyMedium" style={styles.bannerText}>
                Bank accounts require verification. You'll receive two small deposits in 1-3 business days to complete setup.
              </Text>
            </Banner>
          )}

          {/* Account Holder Information */}
          <Card style={styles.formCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Account Holder Information
              </Text>

              <TextInput mode="outlined" label="Account Holder Name *" value={name} onChangeText={setName} style={styles.input} placeholder="Enter full name as it appears on account" />

              <Text variant="titleSmall" style={styles.fieldLabel}>
                Account Type *
              </Text>
              <Menu
                visible={showAccountTypeMenu}
                onDismiss={() => setShowAccountTypeMenu(false)}
                anchor={
                  <TouchableOpacity style={styles.selector} onPress={() => setShowAccountTypeMenu(true)}>
                    <Text variant="bodyLarge" style={styles.selectorText}>
                      {getAccountTypeLabel(selectedType)}
                    </Text>
                    <MaterialIcons name="expand-more" size={24} color="#9E9E9E" />
                  </TouchableOpacity>
                }>
                {accountTypes.map(type => (
                  <Menu.Item
                    key={type.value}
                    onPress={() => {
                      setSelectedType(type.value);
                      setShowAccountTypeMenu(false);
                    }}
                    title={type.label}
                  />
                ))}
              </Menu>
            </Card.Content>
          </Card>

          {/* Bank Account Details */}
          {!isEditing && (
            <Card style={styles.formCard}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Bank Account Details
                  </Text>
                  <TouchableOpacity style={styles.toggleButton} onPress={() => setShowBankDetails(!showBankDetails)}>
                    <MaterialIcons name={showBankDetails ? "visibility-off" : "visibility"} size={20} color="#1565C0" />
                    <Text variant="labelMedium" style={styles.toggleText}>
                      {showBankDetails ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TextInput mode="outlined" label="Routing Number *" value={formatRoutingNumber(routingNumber)} onChangeText={handleRoutingNumberChange} keyboardType="number-pad" style={styles.input} placeholder="123-456-789" maxLength={11} secureTextEntry={!showBankDetails} right={<TextInput.Icon icon="bank" />} />

                <TextInput mode="outlined" label="Account Number *" value={accountNumber} onChangeText={handleAccountNumberChange} keyboardType="number-pad" style={styles.input} placeholder="Enter account number" maxLength={17} secureTextEntry={!showBankDetails} right={<TextInput.Icon icon="account-balance" />} />

                <View style={styles.switchRow}>
                  <View style={styles.switchContent}>
                    <Text variant="titleSmall" style={styles.switchTitle}>
                      Save for future donations
                    </Text>
                    <Text variant="bodySmall" style={styles.switchSubtitle}>
                      Securely store this account for faster giving
                    </Text>
                  </View>
                  <Switch value={saveForFuture} onValueChange={setSaveForFuture} thumbColor={saveForFuture ? "#1565C0" : "#f4f3f4"} trackColor={{ false: "#767577", true: "#1565C0" }} />
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Security Information */}
          <Card style={styles.securityCard}>
            <Card.Content>
              <View style={styles.securityHeader}>
                <MaterialIcons name="security" size={24} color="#70DC87" />
                <Text variant="titleMedium" style={styles.securityTitle}>
                  Your Information is Secure
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.securityText}>
                We use bank-level security and encryption to protect your financial information. Your data is never stored on our servers.
              </Text>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button mode="outlined" onPress={() => setMode("display")} style={styles.cancelButton} labelStyle={styles.cancelButtonText}>
          Cancel
        </Button>

        <Button mode="contained" onPress={handleSave} loading={isSubmitting} disabled={isSubmitting} style={styles.saveButton} labelStyle={styles.saveButtonText} buttonColor="#1565C0">
          {showVerifyForm ? "Verify Account" : isEditing ? "Update Account" : "Add Account"}
        </Button>
      </View>

      {/* Delete Button for existing accounts */}
      {isEditing && !showVerifyForm && (
        <>
          <Divider style={styles.divider} />
          <Button mode="text" onPress={handleDelete} style={styles.deleteButton} labelStyle={styles.deleteButtonText} icon="delete">
            Remove Bank Account
          </Button>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F6F6F8",
    justifyContent: "center",
    alignItems: "center"
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#3c3c3c",
    fontWeight: "700",
    marginHorizontal: 16
  },
  headerSpacer: {
    width: 40
  },

  // Cards
  instructionsCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: "#FFFFFF"
  },
  instructionsHeader: {
    alignItems: "center",
    marginBottom: 16
  },
  instructionsTitle: {
    color: "#3c3c3c",
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center"
  },
  instructionsText: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 22
  },

  formCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: "#FFFFFF"
  },

  securityCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    elevation: 1,
    backgroundColor: "#F8FFF8",
    borderWidth: 1,
    borderColor: "rgba(112, 220, 135, 0.2)"
  },

  // Sections
  sectionTitle: {
    color: "#3c3c3c",
    fontWeight: "700",
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },

  // Form Elements
  input: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF"
  },
  fieldLabel: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 8
  },

  // Selector
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F6F6F8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 16
  },
  selectorText: {
    color: "#3c3c3c",
    fontWeight: "500"
  },

  // Deposit Fields
  depositRow: {
    flexDirection: "row",
    gap: 12
  },
  depositField: {
    flex: 1
  },
  depositInput: {
    backgroundColor: "#FFFFFF"
  },
  dollarSign: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1565C0"
  },

  // Toggle Button
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(21, 101, 192, 0.1)",
    borderRadius: 16
  },
  toggleText: {
    color: "#1565C0",
    fontWeight: "600",
    marginLeft: 4
  },

  // Switch
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8
  },
  switchContent: {
    flex: 1,
    marginRight: 16
  },
  switchTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 2
  },
  switchSubtitle: {
    color: "#9E9E9E"
  },

  // Security Section
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  securityTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginLeft: 8
  },
  securityText: {
    color: "#9E9E9E",
    lineHeight: 20
  },

  // Banner
  infoBanner: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: "rgba(21, 101, 192, 0.05)"
  },
  bannerText: {
    color: "#3c3c3c",
    lineHeight: 20
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12
  },
  cancelButton: {
    flex: 1,
    borderColor: "#9E9E9E"
  },
  cancelButtonText: {
    color: "#9E9E9E",
    fontWeight: "600"
  },
  saveButton: {
    flex: 2,
    elevation: 2
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700"
  },

  // Delete Button
  divider: {
    marginHorizontal: 16
  },
  deleteButton: {
    margin: 16,
    marginTop: 8
  },
  deleteButtonText: {
    color: "#B0120C",
    fontWeight: "600"
  }
});

import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { Card, Text, TextInput, Button, Menu, Divider } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { ApiHelper } from "../../helpers";
import { StripeBankAccountUpdateInterface, StripeBankAccountVerifyInterface, StripePaymentMethod } from "../../interfaces";
import { collectBankAccountForSetup, confirmSetupIntent } from "@stripe/stripe-react-native";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import { useThemeColors } from "../../theme";

interface Props {
  setMode: (mode: string) => void;
  bank: StripePaymentMethod;
  customerId: string;
  updatedFunction: () => void;
  handleDelete: () => void;
  showVerifyForm: boolean;
}

const getAccountTypes = (t: (key: string) => string) => [
  { label: t("donations.individual"), value: "individual" },
  { label: t("donations.company"), value: "company" }
];

export function EnhancedBankForm({ bank, customerId, setMode, updatedFunction, handleDelete, showVerifyForm }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAccountTypeMenu, setShowAccountTypeMenu] = useState<boolean>(false);
  const accountTypes = getAccountTypes(t);
  const [selectedType, setSelectedType] = useState(bank.account_holder_type || accountTypes[0].value);
  const [name, setName] = useState<string>(bank.account_holder_name || "");
  const [firstDeposit, setFirstDeposit] = useState<string>("");
  const [secondDeposit, setSecondDeposit] = useState<string>("");
  const [bankConnecting, setBankConnecting] = useState<boolean>(false);

  const currentUserChurch = useCurrentUserChurch();
  const person = currentUserChurch?.person;

  // Pre-populate name for new bank accounts
  useEffect(() => {
    if (!bank.id && person?.name?.display && !name) {
      setName(person.name.display);
    }
  }, [bank.id, person?.name?.display, name]);

  const getAccountTypeLabel = (value: string) => accountTypes.find(type => type.value === value)?.label || t("donations.individual");

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
      Alert.alert(t("donations.requiredField"), t("donations.enterAccountHolderName"));
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
        Alert.alert(t("donations.error"), response.raw.message);
      } else {
        Alert.alert(t("donations.success"), t("donations.bankAccountUpdated"));
        setMode("display");
        await updatedFunction();
      }
    } catch {
      Alert.alert(t("donations.error"), t("donations.failedUpdateBank"));
    }

    setIsSubmitting(false);
  };

  const createBank = async () => {
    setBankConnecting(true);

    try {
      // Step 1: Create ACH SetupIntent on the backend
      const setupResponse = await ApiHelper.post("/paymentmethods/ach-setup-intent", {
        personId: person?.id || "",
        customerId,
        email: person?.contactInfo?.email || "",
        name: name.trim() || person?.name?.display || ""
      }, "GivingApi");

      if (setupResponse?.error) {
        Alert.alert(t("donations.error"), setupResponse.error);
        setBankConnecting(false);
        setIsSubmitting(false);
        return;
      }

      // Step 2: Collect bank account using Financial Connections
      const { setupIntent: collectedSetupIntent, error: collectError } = await collectBankAccountForSetup(
        setupResponse.clientSecret,
        {
          paymentMethodType: "USBankAccount",
          paymentMethodData: {
            billingDetails: {
              name: name.trim() || person?.name?.display || "",
              email: person?.contactInfo?.email || ""
            }
          }
        }
      );

      if (collectError) {
        Alert.alert(t("donations.error"), collectError.message || t("donations.failedCreateBank"));
        setBankConnecting(false);
        setIsSubmitting(false);
        return;
      }

      // Check if user completed the flow
      if (!collectedSetupIntent?.paymentMethod?.id) {
        Alert.alert(t("donations.error"), t("donations.bankConnectionNotCompleted"));
        setBankConnecting(false);
        setIsSubmitting(false);
        return;
      }

      // Step 3: Confirm the SetupIntent
      const { setupIntent: confirmedIntent, error: confirmError } = await confirmSetupIntent(
        setupResponse.clientSecret,
        { paymentMethodType: "USBankAccount" }
      );

      if (confirmError) {
        Alert.alert(t("donations.error"), confirmError.message || t("donations.failedCreateBank"));
        setBankConnecting(false);
        setIsSubmitting(false);
        return;
      }

      if (confirmedIntent?.status === "Succeeded") {
        Alert.alert(t("donations.success"), t("donations.bankAccountAdded"));
        setMode("display");
        await updatedFunction();
      } else if (confirmedIntent?.status === "RequiresAction") {
        Alert.alert(t("donations.success"), t("donations.bankAccountAddedVerifyRequired"));
        setMode("display");
        await updatedFunction();
      } else {
        Alert.alert(t("donations.error"), t("donations.unexpectedStatus"));
      }
    } catch (error: any) {
      Alert.alert(t("donations.error"), error.message || t("donations.failedCreateBank"));
    }

    setBankConnecting(false);
    setIsSubmitting(false);
  };

  const verifyBank = async () => {
    if (!firstDeposit || !secondDeposit) {
      setIsSubmitting(false);
      Alert.alert(t("donations.required"), t("donations.enterBothDepositAmounts"));
      return;
    }

    const verifyPayload: StripeBankAccountVerifyInterface = { paymentMethodId: bank.id, customerId, amountData: { amounts: [firstDeposit, secondDeposit] } };

    try {
      const response = await ApiHelper.post("/paymentmethods/verifyBank", verifyPayload, "GivingApi");
      if (response?.raw?.message) {
        Alert.alert(t("donations.error"), response.raw.message);
      } else {
        Alert.alert(t("donations.success"), t("donations.bankAccountVerified"));
        setMode("display");
        await updatedFunction();
      }
    } catch {
      Alert.alert(t("donations.error"), t("donations.failedVerifyBank"));
    }

    setIsSubmitting(false);
  };

  const isEditing = !!bank.id;
  const title = isEditing ? `${bank.name?.toUpperCase()} ****${bank.last4}` : t("donations.addBankAccount");

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.background }]} onPress={() => setMode("display")}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text variant="headlineSmall" style={[styles.headerTitle, { color: colors.text }]}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {showVerifyForm ? (
        <>
          {/* Verification Instructions */}
          <Card style={[styles.instructionsCard, { backgroundColor: colors.card }]}>
            <Card.Content>
              <View style={styles.instructionsHeader}>
                <MaterialIcons name="verified-user" size={48} color={colors.primary} />
                <Text variant="titleLarge" style={[styles.instructionsTitle, { color: colors.text }]}>
                  {t("donations.verifyYourAccount")}
                </Text>
              </View>
              <Text variant="bodyLarge" style={[styles.instructionsText, { color: colors.disabled }]}>
                {t("donations.verifyInstructions")}
              </Text>
            </Card.Content>
          </Card>

          {/* Verification Form */}
          <Card style={[styles.formCard, { backgroundColor: colors.card }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
                {t("donations.depositAmounts")}
              </Text>

              <View style={styles.depositRow}>
                <View style={styles.depositField}>
                  <TextInput mode="outlined" label={t("donations.firstDeposit")} value={firstDeposit} onChangeText={setFirstDeposit} keyboardType="decimal-pad" style={styles.depositInput} left={<TextInput.Icon icon={() => <Text style={[styles.dollarSign, { color: colors.primary }]}>$</Text>} />} />
                </View>
                <View style={styles.depositField}>
                  <TextInput mode="outlined" label={t("donations.secondDeposit")} value={secondDeposit} onChangeText={setSecondDeposit} keyboardType="decimal-pad" style={styles.depositInput} left={<TextInput.Icon icon={() => <Text style={[styles.dollarSign, { color: colors.primary }]}>$</Text>} />} />
                </View>
              </View>
            </Card.Content>
          </Card>
        </>
      ) : (
        <>
          {/* Account Holder Information (for editing existing accounts) */}
          {isEditing ? (
            <Card style={[styles.formCard, { backgroundColor: colors.card }]}>
              <Card.Content>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
                  {t("donations.accountHolderInfo")}
                </Text>

                <TextInput mode="outlined" label={t("donations.accountHolderName")} value={name} onChangeText={setName} style={[styles.input, { backgroundColor: colors.card }]} placeholder={t("donations.enterFullName")} />

                <Text variant="titleSmall" style={[styles.fieldLabel, { color: colors.text }]}>
                  {t("donations.accountType")}
                </Text>
                <Menu
                  visible={showAccountTypeMenu}
                  onDismiss={() => setShowAccountTypeMenu(false)}
                  anchor={
                    <TouchableOpacity style={[styles.selector, { backgroundColor: colors.background, borderColor: colors.divider }]} onPress={() => setShowAccountTypeMenu(true)}>
                      <Text variant="bodyLarge" style={[styles.selectorText, { color: colors.text }]}>
                        {getAccountTypeLabel(selectedType)}
                      </Text>
                      <MaterialIcons name="expand-more" size={24} color={colors.disabled} />
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
          ) : (
            /* Financial Connections flow for new bank accounts */
            <Card style={[styles.formCard, { backgroundColor: colors.card }]}>
              <Card.Content style={styles.connectContent}>
                <MaterialIcons name="account-balance" size={48} color={colors.primary} />
                <Text variant="titleMedium" style={[styles.connectTitle, { color: colors.text }]}>
                  {t("donations.connectBankAccount")}
                </Text>
                <Text variant="bodyMedium" style={[styles.connectDescription, { color: colors.disabled }]}>
                  {t("donations.financialConnectionsInfo")}
                </Text>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={bankConnecting}
                  disabled={bankConnecting || isSubmitting}
                  style={styles.connectButton}
                  labelStyle={[styles.saveButtonText, { color: colors.white }]}
                  buttonColor={colors.primary}
                  icon="bank"
                >
                  {bankConnecting ? t("donations.connecting") : t("donations.connectBank")}
                </Button>
              </Card.Content>
            </Card>
          )}
        </>
      )}

      {/* Action Buttons — shown for editing existing accounts or verifying, not for new (Financial Connections handles its own flow) */}
      {(isEditing || showVerifyForm) && (
        <View style={styles.actionButtons}>
          <Button mode="outlined" onPress={() => setMode("display")} style={[styles.cancelButton, { borderColor: colors.disabled }]} labelStyle={[styles.cancelButtonText, { color: colors.disabled }]}>
            {t("common.cancel")}
          </Button>

          <Button mode="contained" onPress={handleSave} loading={isSubmitting} disabled={isSubmitting} style={styles.saveButton} labelStyle={[styles.saveButtonText, { color: colors.white }]} buttonColor={colors.primary}>
            {showVerifyForm ? t("donations.verifyAccount") : t("donations.updateAccount")}
          </Button>
        </View>
      )}

      {/* Cancel button for new bank account flow */}
      {!isEditing && !showVerifyForm && (
        <View style={styles.actionButtons}>
          <Button mode="outlined" onPress={() => setMode("display")} style={[styles.cancelButton, { borderColor: colors.disabled }]} labelStyle={[styles.cancelButtonText, { color: colors.disabled }]}>
            {t("common.cancel")}
          </Button>
        </View>
      )}

      {/* Delete Button for existing accounts */}
      {isEditing && !showVerifyForm && (
        <>
          <Divider style={styles.divider} />
          <Button mode="text" onPress={handleDelete} style={styles.deleteButton} labelStyle={[styles.deleteButtonText, { color: colors.error }]} icon="delete">
            {t("donations.removeBankAccount")}
          </Button>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center"
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontWeight: "700",
    marginHorizontal: 16
  },
  headerSpacer: { width: 40 },

  // Cards
  instructionsCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 2
  },
  instructionsHeader: {
    alignItems: "center",
    marginBottom: 16
  },
  instructionsTitle: {
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center"
  },
  instructionsText: {
    textAlign: "center",
    lineHeight: 22
  },

  formCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    elevation: 2
  },

  securityCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    elevation: 1,
    borderWidth: 1,
    borderColor: "rgba(112, 220, 135, 0.2)"
  },

  // Sections
  sectionTitle: {
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
  input: { marginBottom: 16 },
  fieldLabel: {
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
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16
  },
  selectorText: { fontWeight: "500" },

  // Deposit Fields
  depositRow: {
    flexDirection: "row",
    gap: 12
  },
  depositField: { flex: 1 },
  depositInput: {},
  dollarSign: {
    fontSize: 16,
    fontWeight: "600"
  },

  // Connect Bank Account
  connectContent: {
    alignItems: "center",
    paddingVertical: 24
  },
  connectTitle: {
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center"
  },
  connectDescription: {
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 16
  },
  connectButton: {
    minWidth: 200,
    elevation: 2
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
    fontWeight: "600",
    marginBottom: 2
  },
  switchSubtitle: {},

  // Security Section
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  securityTitle: {
    fontWeight: "600",
    marginLeft: 8
  },
  securityText: { lineHeight: 20 },

  // Banner
  infoBanner: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: "rgba(21, 101, 192, 0.05)"
  },
  bannerText: { lineHeight: 20 },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12
  },
  cancelButton: { flex: 1 },
  cancelButtonText: { fontWeight: "600" },
  saveButton: {
    flex: 2,
    elevation: 2
  },
  saveButtonText: { fontWeight: "700" },

  // Delete Button
  divider: { marginHorizontal: 16 },
  deleteButton: {
    margin: 16,
    marginTop: 8
  },
  deleteButtonText: { fontWeight: "600" }
});

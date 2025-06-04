import { ApiHelper, UserHelper, globalStyles } from "@/src/helpers"; // Constants removed
import { ErrorHelper } from "@/src/helpers/ErrorHelper";
import { Permissions, StripePaymentMethod } from "@/src/interfaces";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, View, StyleSheet } from "react-native"; // ActivityIndicator, Text, TouchableOpacity removed
import { FlatList } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome"; // Kept for headerIcon, could be mapped
// FontAwesome5 is replaced by IconButton "pencil"
import { DisplayBox } from "../DisplayBox"; // Custom component, internals not refactored here
import { PaymentMethodModal } from "../modals/PaymentMethodModal"; // Custom component
import { BankForm } from "./BankForm"; // Custom component
import { CardForm } from "./CardForm"; // Custom component
import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import { ActivityIndicator as PaperActivityIndicator, Button as PaperButton, IconButton as PaperIconButton, Text as PaperText, useTheme } from 'react-native-paper';

interface Props {
  customerId: string;
  paymentMethods: StripePaymentMethod[];
  updatedFunction: () => void;
  isLoading: boolean;
  publishKey: string;
}

export function PaymentMethods({ customerId, paymentMethods, updatedFunction, isLoading, publishKey }: Props) {
  const theme = useTheme();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editPaymentMethod, setEditPaymentMethod] = useState<StripePaymentMethod>(new StripePaymentMethod());
  const [verifyAccountState, setVerifyAccountState] = useState<boolean>(false); // Renamed 'verify' to avoid conflict if any
  const [mode, setMode] = useState<"display" | "edit">("display");
  const isFocused = useIsFocused();

  const rightHeaderContent = ({ size }: { size: number }) => (
    <PaperIconButton icon="plus" iconColor={theme.colors.primary} size={size} onPress={() => setShowModal(true)} />
  );

  useEffect(() => {
    if (isFocused) {
      setMode("display");
      setEditPaymentMethod(new StripePaymentMethod());
    }
  }, [isFocused]);

  const handleEdit = (paymentMethod: StripePaymentMethod, verifyAccountParam?: boolean) => {
    setEditPaymentMethod(paymentMethod);
    setVerifyAccountState(!!verifyAccountParam);
    setMode("edit");
  };

  const handleDelete = () => {
    Alert.alert("Are you sure?", "This will permantly delete this payment method", [
      { text: "Cancel", onPress: () => { }, style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          try {
            await ApiHelper.delete("/paymentmethods/" + editPaymentMethod.id + "/" + customerId, "GivingApi");
            setMode("display");
            await updatedFunction();
          } catch (err: any) {
            Alert.alert("Error in deleting the method"); // Consider using Paper.Snackbar or Dialog for errors
            ErrorHelper.logError("payment-method-delete", err);
          }
        },
      },
    ]);
  };

  let editModeContent: any = null;
  switch (editPaymentMethod.type) {
    case "card":
      editModeContent = (
        <CardForm setMode={setMode} card={editPaymentMethod} customerId={customerId} updatedFunction={updatedFunction} handleDelete={handleDelete} />
      );
      break;
    case "bank":
      editModeContent = (
        <BankForm setMode={setMode} bank={editPaymentMethod} customerId={customerId} updatedFunction={updatedFunction} handleDelete={handleDelete} showVerifyForm={verifyAccountState} publishKey={publishKey} />
      );
      break;
  }

  const getEditButton = (item: StripePaymentMethod) => {
    if (!UserHelper.checkAccess(Permissions.givingApi.settings.edit)) return null;
    return (
      <PaperIconButton icon="pencil" iconColor={theme.colors.primary} size={DimensionHelper.wp(5.5)} onPress={() => handleEdit(item)} />
    );
  };

  const styles = StyleSheet.create({
    cardListView: { // From globalStyles.cardListView
      ...globalStyles.cardListView, // Spread to keep original layout if complex
      // Example: Replace with Paper specific styling if desired
      // padding: theme.spacing.md,
      // flexDirection: 'row',
      // alignItems: 'center',
      // justifyContent: 'space-between',
    },
    cardListText: { // From globalStyles.cardListText
      ...globalStyles.cardListText, // Spread original
      color: theme.colors.onSurface, // Use theme color
    },
    verifyTextButton: { // For the "Verify" text
      color: theme.colors.primary,
      // width: DimensionHelper.wp(10) // Button component might handle width better
    },
    noPaymentText: {
      ...globalStyles.paymentDetailText, // Spread original
      color: theme.colors.onSurfaceVariant, // Use a less prominent color
      textAlign: 'center',
      margin: theme.spacing?.md || 16,
    },
    cardListSeparator: { // from globalStyles.cardListSeperator
      ...globalStyles.cardListSeperator
      // backgroundColor: theme.colors.outline, // Example
    },
    activityIndicator: {
      margin: DimensionHelper.wp(2),
    }
  });

  const paymentTable =
    paymentMethods.length > 0 ? (
      <FlatList
        data={paymentMethods}
        renderItem={({ item }) => (
          <View style={styles.cardListView} key={item.id}>
            <PaperText style={styles.cardListText}> {item.name + " ****" + item.last4}</PaperText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {item?.status === "new" && (
                <PaperButton mode="text" onPress={() => handleEdit(item, true)} labelStyle={styles.verifyTextButton} compact>
                  Verify
                </PaperButton>
              )}
              {getEditButton(item)}
            </View>
          </View>
        )}
        keyExtractor={(item: any) => item.id}
        ItemSeparatorComponent={() => <View style={styles.cardListSeparator} />}
      />
    ) : (
      <PaperText style={styles.noPaymentText}>No payment methods.</PaperText>
    );

  const content =
    mode === "display" ? (
      <DisplayBox
        title="Payment Methods"
        rightHeaderComponent={rightHeaderContent}
        headerIcon={({ size }) => <Icon name={"credit-card-alt"} style={{ color: theme.colors.onSurfaceVariant }} size={size} />} // Themed color for icon
      >
        {isLoading ? (
          <PaperActivityIndicator size="large" style={styles.activityIndicator} color={theme.colors.primary} animating={isLoading} />
        ) : (
          paymentTable
        )}
      </DisplayBox>
    ) : (
      editModeContent
    );

  return (
    <>
      <PaymentMethodModal show={showModal} close={() => setShowModal(false)} onSelect={handleEdit} />
      {content}
    </>
  );
}

import React, { useEffect, useState } from "react";
import { ApiHelper, UserHelper } from "../../../src/helpers";
import { ErrorHelper } from "../../mobilehelper";
import { Permissions, StripePaymentMethod } from "../../../src/interfaces";
import { useIsFocused } from "@react-navigation/native";
import { Alert, View } from "react-native";
import { ActivityIndicator, Button, Card, Divider, IconButton, List, Text, useTheme } from "react-native-paper";
import { useAppTheme } from "../../../src/theme";
import { EnhancedPaymentMethodModal } from "../modals/EnhancedPaymentMethodModal";
import { EnhancedBankForm } from "./EnhancedBankForm";
import { CardForm } from "./CardForm";

interface Props {
  customerId: string;
  paymentMethods: StripePaymentMethod[];
  updatedFunction: () => void;
  isLoading: boolean;
  publishKey: string;
}

export function PaymentMethods({ customerId, paymentMethods, updatedFunction, isLoading }: Props) {
  const { spacing } = useAppTheme();
  const theme = useTheme();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editPaymentMethod, setEditPaymentMethod] = useState<StripePaymentMethod>(new StripePaymentMethod());
  const [verify, setVerify] = useState<boolean>(false);
  const [mode, setMode] = useState<"display" | "edit">("display");
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setMode("display");
      setEditPaymentMethod(new StripePaymentMethod());
    }
  }, [isFocused]);

  const handleEdit = (paymentMethod: StripePaymentMethod, verifyAccount?: boolean) => {
    setEditPaymentMethod(paymentMethod);
    setVerify(!!verifyAccount);
    setMode("edit");
  };

  const handleDelete = () => {
    Alert.alert("Are you sure?", "This will permanently delete this payment method", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel"
      },
      {
        text: "OK",
        onPress: async () => {
          try {
            await ApiHelper.delete("/paymentmethods/" + editPaymentMethod.id + "/" + customerId, "GivingApi");
            setMode("display");
            await updatedFunction();
          } catch (err: any) {
            Alert.alert("Error in deleting the method");
            ErrorHelper.logError("payment-method-delete", err);
          }
        }
      }
    ]);
  };

  let editModeContent: any = null;
  switch (editPaymentMethod.type) {
    case "card":
      editModeContent = <CardForm setMode={setMode} card={editPaymentMethod} customerId={customerId} updatedFunction={updatedFunction} handleDelete={handleDelete} />;
      break;
    case "bank":
      editModeContent = <EnhancedBankForm setMode={setMode} bank={editPaymentMethod} customerId={customerId} updatedFunction={updatedFunction} handleDelete={handleDelete} showVerifyForm={verify} />;
      break;
  }

  const getMethodIcon = (type: string) => (type === "card" ? "credit-card" : "bank");

  const getMethodTitle = (method: StripePaymentMethod) => `${method.name} ending in ${method.last4}`;

  const getMethodDescription = (method: StripePaymentMethod) => {
    if (method.status === "new") return "Verification required";
    return method.type === "card" ? "Credit Card" : "Bank Account";
  };

  const renderPaymentMethod = ({ item }: { item: StripePaymentMethod }) => (
    <List.Item
      title={getMethodTitle(item)}
      description={getMethodDescription(item)}
      left={() => <List.Icon icon={getMethodIcon(item.type)} />}
      right={() => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {item?.status === "new" && (
            <Button mode="text" onPress={() => handleEdit(item, true)} style={{ marginRight: spacing.xs }}>
              Verify
            </Button>
          )}
          {UserHelper.checkAccess(Permissions.givingApi.settings.edit) && <IconButton icon="pencil" size={20} onPress={() => handleEdit(item)} />}
        </View>
      )}
    />
  );

  const content =
    mode === "display" ? (
      <Card style={{ marginBottom: spacing.md }}>
        <Card.Title title="Payment Methods" titleStyle={{ fontSize: 20, fontWeight: "600" }} left={props => <IconButton {...props} icon="credit-card" size={24} iconColor={theme.colors.primary} style={{ margin: 0 }} />} right={props => UserHelper.checkAccess(Permissions.givingApi.settings.edit) && <IconButton {...props} icon="plus" size={24} iconColor={theme.colors.primary} onPress={() => setShowModal(true)} style={{ margin: 0 }} />} />
        <Card.Content>
          {isLoading ? (
            <ActivityIndicator size="large" style={{ margin: spacing.md }} color={theme.colors.primary} />
          ) : paymentMethods.length > 0 ? (
            <>
              {paymentMethods.map((item, index) => (
                <React.Fragment key={item.id}>
                  {renderPaymentMethod({ item })}
                  {index < paymentMethods.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {UserHelper.checkAccess(Permissions.givingApi.settings.edit) && (
                <>
                  <Divider style={{ marginVertical: spacing.sm }} />
                  <Button mode="outlined" onPress={() => setShowModal(true)} icon="plus" style={{ marginTop: spacing.sm }}>
                    Add Payment Method
                  </Button>
                </>
              )}
            </>
          ) : (
            <View style={{ alignItems: "center", marginVertical: spacing.md }}>
              <Text variant="bodyMedium" style={{ textAlign: "center", marginBottom: spacing.md }}>
                No payment methods added yet.
              </Text>
              {UserHelper.checkAccess(Permissions.givingApi.settings.edit) && (
                <Button mode="contained" onPress={() => setShowModal(true)} icon="plus">
                  Add Your First Payment Method
                </Button>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    ) : (
      editModeContent
    );

  return (
    <>
      <EnhancedPaymentMethodModal show={showModal} close={() => setShowModal(false)} onSelect={handleEdit} />
      {content}
    </>
  );
}

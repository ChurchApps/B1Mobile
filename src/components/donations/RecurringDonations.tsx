import { ApiHelper, CurrencyHelper, DateHelper, UserHelper } from "@/src/helpers";
import { ErrorHelper } from "@/src/helpers/ErrorHelper";
import { StripePaymentMethod, SubscriptionInterface } from "@/src/interfaces";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { ActivityIndicator, Button, Card, Divider, IconButton, List, Menu, Portal, Text, useTheme } from "react-native-paper";
import { useAppTheme } from "@/src/theme";
import { CustomModal } from "../modals/CustomModal";
import { DimensionHelper } from "@/src/helpers/DimensionHelper";

interface Props {
  customerId: string;
  paymentMethods: StripePaymentMethod[];
  updatedFunction: () => void;
}

export function RecurringDonations({ customerId, paymentMethods: pm, updatedFunction }: Props) {
  const { spacing } = useAppTheme();
  const theme = useTheme();
  const [subscriptions, setSubscriptions] = React.useState<SubscriptionInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionInterface>({} as SubscriptionInterface);
  const [showMethodMenu, setShowMethodMenu] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [showIntervalMenu, setShowIntervalMenu] = useState<boolean>(false);
  const [intervalTypes] = useState<{ label: string; value: string }[]>([
    { label: "Day(s)", value: "day" },
    { label: "Week(s)", value: "week" },
    { label: "Month(s)", value: "month" },
    { label: "Year(s)", value: "year" }
  ]);
  const [selectedInterval, setSelectedInterval] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const isFocused = useIsFocused();
  const person = UserHelper.currentUserChurch?.person;

  const loadDonations = () => {
    if (customerId) {
      setIsLoading(true);
      ApiHelper.get("/customers/" + customerId + "/subscriptions", "GivingApi").then(subResult => {
        const subs: SubscriptionInterface[] = [];
        const requests = subResult.data?.map((s: any) =>
          ApiHelper.get("/subscriptionfunds?subscriptionId=" + s.id, "GivingApi").then(subFunds => {
            s.funds = subFunds;
            subs.push(s);
          })
        );
        return (
          requests &&
          Promise.all(requests).then(() => {
            setSubscriptions(subs);
            setIsLoading(false);
          })
        );
      });
    }
  };

  const getInterval = (subscription: SubscriptionInterface) => {
    let interval = subscription?.plan?.interval_count + " " + subscription?.plan?.interval;
    return subscription?.plan?.interval_count > 1 ? interval + "s" : interval;
  };

  useEffect(() => {
    if (isFocused) {
      if (person) {
        loadDonations();
      }
    }
  }, [isFocused]);

  useEffect(loadDonations, [customerId]);

  const getMethodLabel = (methodId: string) => {
    const method = pm.find(m => m.id === methodId);
    return method ? `${method.name} ending in ${method.last4}` : "Select Payment Method";
  };

  const getIntervalLabel = (interval: string) => intervalTypes.find(i => i.value === interval)?.label || "Select Interval";

  const renderSubscription = (sub: SubscriptionInterface) => {
    const total = CurrencyHelper.formatCurrency(sub.plan.amount / 100);
    const interval = getInterval(sub);

    return (
      <List.Item
        key={sub.id}
        title={`${total} / ${interval}`}
        description={`Started ${DateHelper.prettyDate(new Date(sub.billing_cycle_anchor * 1000))}`}
        left={props => <List.Icon {...props} icon="calendar-repeat" />}
        right={props => (
          <IconButton
            {...props}
            icon="pencil"
            onPress={() => {
              setShowModal(true);
              setSelectedSubscription(sub);
              setSelectedMethod(sub.default_payment_method || sub.default_source);
              setSelectedInterval(sub.plan.interval);
            }}
          />
        )}
      />
    );
  };

  const handleDelete = () => {
    Alert.alert("Are you sure?", "This will permanently delete and stop the recurring payments", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel"
      },
      {
        text: "OK",
        onPress: async () => {
          try {
            setIsDeleting(true);
            let promises: any[] = [];
            promises.push(ApiHelper.delete("/subscriptions/" + selectedSubscription.id, "GivingApi"));
            promises.push(ApiHelper.delete("/subscriptionfunds/subscription/" + selectedSubscription.id, "GivingApi"));
            await Promise.all(promises);
            setIsDeleting(false);
            setShowModal(false);
            await updatedFunction();
            loadDonations();
          } catch (err: any) {
            setIsDeleting(false);
            Alert.alert("Error in deleting the method");
            ErrorHelper.logError("Delete-recurring-payment", err);
          }
        }
      }
    ]);
  };

  const getFunds = (subscription: SubscriptionInterface) => (
    <View style={{ marginVertical: spacing.sm }}>
      {subscription?.funds?.map((fund: any) => (
        <View key={subscription.id + fund.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs }}>
          <Text variant="bodyMedium" style={{ flex: 1, marginRight: spacing.sm }}>
            {fund.name}
          </Text>
          <Text variant="bodyMedium">{CurrencyHelper.formatCurrency(fund.amount)}</Text>
        </View>
      ))}
      <Divider style={{ marginVertical: spacing.xs }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text variant="titleMedium">Total</Text>
        <Text variant="titleMedium">{CurrencyHelper.formatCurrency(subscription?.plan?.amount / 100)}</Text>
      </View>
    </View>
  );

  const content = (
    <Card style={{ marginBottom: spacing.md }}>
      <Card.Title
        title="Recurring Donations"
        titleStyle={{ fontSize: 20, fontWeight: "600" }}
        left={props => <IconButton {...props} icon="repeat" size={24} iconColor={theme.colors.primary} style={{ margin: 0 }} />}
      />
      <Card.Content>
        {isLoading ? (
          <ActivityIndicator size="large" style={{ margin: spacing.md }} color={theme.colors.primary} />
        ) : subscriptions.length > 0 ? (
          <>
            {subscriptions.map((sub, index) => (
              <React.Fragment key={sub.id}>
                {renderSubscription(sub)}
                {index < subscriptions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </>
        ) : (
          <Text variant="bodyMedium" style={{ textAlign: "center", marginVertical: spacing.md }}>
            No recurring donations.
          </Text>
        )}
      </Card.Content>

      <Portal>
        <CustomModal isVisible={showModal} close={() => setShowModal(false)} width={DimensionHelper.wp(85)}>
          <View style={{ padding: spacing.md }}>
            <Text variant="titleLarge" style={{ marginBottom: spacing.md }}>
              Edit Recurring Donation
            </Text>
            <Menu
              visible={showMethodMenu}
              onDismiss={() => setShowMethodMenu(false)}
              anchor={
                <Button mode="outlined" onPress={() => setShowMethodMenu(true)} style={{ marginBottom: spacing.md }}>
                  {getMethodLabel(selectedMethod)}
                </Button>
              }>
              {pm.map(method => (
                <Menu.Item
                  key={method.id}
                  onPress={() => {
                    setSelectedMethod(method.id);
                    setShowMethodMenu(false);
                  }}
                  title={`${method.name} ending in ${method.last4}`}
                />
              ))}
            </Menu>

            <Menu
              visible={showIntervalMenu}
              onDismiss={() => setShowIntervalMenu(false)}
              anchor={
                <Button mode="outlined" onPress={() => setShowIntervalMenu(true)} style={{ marginBottom: spacing.md }}>
                  {getIntervalLabel(selectedInterval)}
                </Button>
              }>
              {intervalTypes.map(interval => (
                <Menu.Item
                  key={interval.value}
                  onPress={() => {
                    setSelectedInterval(interval.value);
                    setShowIntervalMenu(false);
                  }}
                  title={interval.label}
                />
              ))}
            </Menu>

            {selectedSubscription && getFunds(selectedSubscription)}

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md }}>
              <Button mode="outlined" onPress={handleDelete} loading={isDeleting} style={{ flex: 1, marginRight: spacing.sm }}>
                Delete
              </Button>
              <Button mode="contained" onPress={() => setShowModal(false)} style={{ flex: 1, marginLeft: spacing.sm }}>
                Close
              </Button>
            </View>
          </View>
        </CustomModal>
      </Portal>
    </Card>
  );

  return content;
}

import { ApiHelper, CurrencyHelper, UserHelper, UserInterface } from "../../../src/helpers";
import { DonationHelper } from "../../../src/helpers/DonationHelper";
import { FundDonationInterface, FundInterface, PersonInterface, StripeDonationInterface, StripePaymentMethod, MultiGatewayDonationInterface, PaymentMethod, PaymentGateway } from "../../../src/interfaces";
import { CardField, CardFieldInput, createPaymentMethod } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { Button, Card, Checkbox, IconButton, Menu, RadioButton, Text, TextInput, useTheme } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { useAppTheme } from "../../../src/theme";
import { PreviewModal } from "../modals/PreviewModal";
import { FundDonations } from "./FundDonations";
import { useUser, useCurrentUserChurch } from "../../../src/stores/useUserStore";

interface Props {
  paymentMethods: StripePaymentMethod[];
  customerId: string;
  updatedFunction: () => void;
}

export function DonationForm({ paymentMethods: pm, customerId, updatedFunction }: Props) {
  const { spacing } = useAppTheme();
  const theme = useTheme();
  const user = useUser();
  const currentUserChurch = useCurrentUserChurch();
  const person = currentUserChurch?.person;
  const [donationType, setDonationType] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [date] = useState(new Date());
  const [fundDonations, setFundDonations] = useState<FundDonationInterface[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details>();
  const [isChecked, setIsChecked] = useState(false);
  const [transactionFee, setTransactionFee] = useState<number>(0);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [selectedInterval, setSelectedInterval] = useState<string>("one_week");
  const [showIntervalMenu, setShowIntervalMenu] = useState(false);
  const [showMethodMenu, setShowMethodMenu] = useState(false);

  // Determine church ID for funds query
  const churchId = !currentUserChurch ? currentUserChurch?.church?.id || "" : !currentUserChurch.person?.id ? (currentUserChurch.church.id ?? "") : currentUserChurch?.church?.id || "";

  // Use react-query for funds
  const { data: funds = [] } = useQuery<FundInterface[]>({
    queryKey: [`/funds/churchId/${churchId}`, "GivingApi"],
    enabled: !!churchId && !!user?.jwt,
    placeholderData: [],
    staleTime: 15 * 60 * 1000, // 15 minutes - funds change rarely
    gcTime: 60 * 60 * 1000 // 1 hour
  });

  // Initialize fund donations when funds data is available
  useEffect(() => {
    if (funds.length > 0 && fundDonations.length === 0) {
      setFundDonations([{ fundId: funds[0].id }]);
    }
  }, [funds, fundDonations.length]);

  const intervalTypes = [
    { label: "Weekly", value: "one_week" },
    { label: "Bi-Weekly", value: "two_week" },
    { label: "Monthly", value: "one_month" },
    { label: "Quarterly", value: "three_month" },
    { label: "Annually", value: "one_year" }
  ];

  const initDonation: StripeDonationInterface = {
    id: pm[0]?.id,
    type: pm[0]?.type,
    customerId: customerId,
    person: {
      id: person?.id || "",
      email: user?.email || "",
      name: user?.firstName + " " + user?.lastName
    },
    amount: 0,
    billing_cycle_anchor: +new Date(),
    interval: {
      interval_count: 1,
      interval: "month"
    },
    funds: []
  };
  const [donation, setDonation] = React.useState<StripeDonationInterface>(initDonation);

  const handleSave = () => {
    if (donation.amount && donation.amount < 0.5) {
      Alert.alert("Donation amount must be greater than $0.50");
    } else {
      if (!currentUserChurch?.person?.id) {
        donation.person = {
          id: "",
          email: email,
          name: firstName + " " + lastName
        };
      }
      setShowPreviewModal(true);
    }
  };

  const handleCancel = () => {
    setDonationType("");
  };

  const handleFundDonationsChange = async (fd: FundDonationInterface[]) => {
    setFundDonations(fd);
    let totalAmount = 0;
    let selectedFunds: any = [];
    for (const fundDonation of fd) {
      totalAmount += fundDonation.amount || 0;
      let fund = funds.find((fund: FundInterface) => fund.id === fundDonation.fundId);
      selectedFunds.push({ id: fundDonation.fundId, amount: fundDonation.amount || 0, name: fund?.name || "" });
    }
    let d = { ...donation };
    d.amount = totalAmount;
    d.funds = selectedFunds;
    setDonation(d);

    const fee = await getTransactionFee(totalAmount);
    setTransactionFee(fee);
    setTotal(calculateTotalWithFees(totalAmount, isChecked, fee));
  };

  const makeDonation = async () => {
    const method = pm.find(pm => pm.id === selectedMethod);
    if (!UserHelper.currentUserChurch?.person?.id) {
      ApiHelper.post("/users/loadOrCreate", { userEmail: email, firstName, lastName }, "MembershipApi")
        .catch(ex => {
          Alert.alert("Failed", ex.toString());
          return;
        })
        .then(async userData => {
          const personData = { churchId: CacheHelper.church!.id, firstName, lastName, email };
          const person = await ApiHelper.post("/people/loadOrCreate", personData, "MembershipApi");
          saveCard(userData, person);
        });
    } else {
      const payload: StripeDonationInterface = {
        ...donation,
        id: selectedMethod,
        customerId: customerId,
        type: method?.type,
        billing_cycle_anchor: +new Date(date),
        amount: parseFloat(total.toFixed(2)),
        church: {
          subDomain: CacheHelper.church?.subDomain
        }
      };
      saveDonation(payload, "");
    }
  };

  const saveCard = async (user: UserInterface, person: PersonInterface) => {
    const stripePaymentMethod = await createPaymentMethod({
      paymentMethodType: "Card",
      ...cardDetails
    });

    if (stripePaymentMethod.error) {
      Alert.alert("Failed", stripePaymentMethod.error.message);
      return;
    } else {
      const pm = { id: stripePaymentMethod.paymentMethod.id, personId: person.id, email: email, name: person.name.display, churchId: CacheHelper.church!.id };
      await ApiHelper.post("/paymentmethods/addcard", pm, "GivingApi").then(result => {
        if (result?.raw?.message) {
          Alert.alert("Failed", result.raw.message);
        } else {
          const d: { paymentMethod: StripePaymentMethod; customerId: string } = result;
          donation.person = {
            name: firstName + " " + lastName,
            id: person.id!,
            email: email
          };
          const payload: StripeDonationInterface = {
            id: d.paymentMethod.id,
            customerId: d.customerId,
            type: d.paymentMethod?.type,
            // amount: donation.amount,
            amount: parseFloat(total.toFixed(2)),
            churchId: CacheHelper.church!.id,
            funds: donation.funds,
            person: donation.person,
            billing_cycle_anchor: +new Date(date),
            interval: donation.interval,
            church: {
              subDomain: CacheHelper.church?.subDomain
            }
          };
          saveDonation(payload, "");
        }
      });
    }
  };

  const saveDonation = async (payload: StripeDonationInterface, _message: string) => {
    let results;
    if (donationType === "once") results = await ApiHelper.post("/donate/charge/", payload, "GivingApi");
    if (donationType === "recurring") results = await ApiHelper.post("/donate/subscribe/", payload, "GivingApi");

    if (results?.status === "succeeded" || results?.status === "pending" || results?.status === "active") {
      setShowPreviewModal(false);
      setDonationType("");
      setTotal(0);
      setFundDonations([{ fundId: funds[0]?.id }]);
      setDonation(initDonation);
      setEmail("");
      setFirstName("");
      setLastName("");
      setIsChecked(false);
      Alert.alert("Thank you for your donation.", _message, [{ text: "OK", onPress: () => updatedFunction() }]);
    }
    if (results?.raw?.message) {
      setShowPreviewModal(false);
      Alert.alert("Failed to make a donation", results?.raw?.message);
    }
  };

  const handleIntervalChange = (key: string, value: any) => {
    const donationsCopy = { ...donation };
    switch (key) {
      case "number":
        if (donationsCopy.interval) donationsCopy.interval.interval_count = value;
        break;
      case "type":
        if (donationsCopy.interval) {
          switch (value) {
            case "one_week":
              donationsCopy.interval.interval_count = 1;
              donationsCopy.interval.interval = "week";
              break;
            case "two_week":
              donationsCopy.interval.interval_count = 2;
              donationsCopy.interval.interval = "week";
              break;
            case "one_month":
              donationsCopy.interval.interval_count = 1;
              donationsCopy.interval.interval = "month";
              break;
            case "three_month":
              donationsCopy.interval.interval_count = 3;
              donationsCopy.interval.interval = "month";
              break;
            case "one_year":
              donationsCopy.interval.interval_count = 1;
              donationsCopy.interval.interval = "year";
              break;
          }
        }
        break;
    }
    setDonation(donationsCopy);
  };

  const calculateTotalWithFees = (baseAmount: number, isChecked: boolean, fee: number = 0) => {
    const feeAmount = isChecked ? fee : 0;
    return baseAmount + feeAmount;
  };

  const getTransactionFee = async (amount: number) => {
    if (amount > 0) {
      const selectedPaymentMethod = pm.find(p => p.id === selectedMethod);
      let requestData: any = { amount };

      if (selectedPaymentMethod?.type === "paypal") {
        requestData.provider = "paypal";
      } else {
        const dt = selectedPaymentMethod?.type === "card" ? "creditCard" : "ach";
        requestData.type = dt;
      }

      try {
        const response = await ApiHelper.post("/donate/fee?churchId=" + currentUserChurch?.church?.id, requestData, "GivingApi");
        return response.calculatedFee;
      } catch (error) {
        // Fallback to credit card calculation
        const fixedFee = 0.3;
        const fixedPercent = 0.029;
        return Math.round(((amount + fixedFee) / (1 - fixedPercent) - amount) * 100) / 100;
      }
    } else {
      return 0;
    }
  };

  const getMethodLabel = (method: StripePaymentMethod) => {
    if (!method) return "";
    return `${method.name} ending in ${method.last4}`;
  };

  return (
    <Card style={{ marginBottom: spacing.md }}>
      <Card.Title title="Make a Donation" titleStyle={{ fontSize: 20, fontWeight: "600" }} left={props => <IconButton {...props} icon="gift" size={24} iconColor={theme.colors.primary} style={{ margin: 0 }} />} />
      <Card.Content>
        <RadioButton.Group onValueChange={value => setDonationType(value)} value={donationType}>
          <View style={{ flexDirection: "row", marginBottom: spacing.md }}>
            <RadioButton.Item label="One Time" value="once" />
            <RadioButton.Item label="Recurring" value="recurring" />
          </View>
        </RadioButton.Group>

        {donationType && (
          <>
            {!currentUserChurch?.person?.id && (
              <View style={{ marginBottom: spacing.md }}>
                <TextInput mode="outlined" label="Email" value={email} onChangeText={setEmail} style={{ marginBottom: spacing.sm }} />
                <TextInput mode="outlined" label="First Name" value={firstName} onChangeText={setFirstName} style={{ marginBottom: spacing.sm }} />
                <TextInput mode="outlined" label="Last Name" value={lastName} onChangeText={setLastName} style={{ marginBottom: spacing.sm }} />
              </View>
            )}

            {pm.length > 0 ? (
              <View style={{ marginBottom: spacing.md }}>
                <Menu
                  visible={showMethodMenu}
                  onDismiss={() => setShowMethodMenu(false)}
                  anchor={
                    <Button mode="outlined" onPress={() => setShowMethodMenu(true)} style={{ marginBottom: spacing.sm }}>
                      {selectedMethod ? getMethodLabel(pm.find(m => m.id === selectedMethod)!) : "Select Payment Method"}
                    </Button>
                  }>
                  {pm.map(method => (
                    <Menu.Item
                      key={method.id}
                      onPress={() => {
                        setSelectedMethod(method.id);
                        setShowMethodMenu(false);
                      }}
                      title={getMethodLabel(method)}
                    />
                  ))}
                </Menu>
              </View>
            ) : (
              <CardField postalCodeEnabled={false} placeholders={{ number: "4242 4242 4242 4242" }} cardStyle={{ backgroundColor: theme.colors.surface }} style={{ height: 50, marginBottom: spacing.md }} onCardChange={details => setCardDetails(details)} />
            )}

            {donationType === "recurring" && (
              <View style={{ marginBottom: spacing.md }}>
                <Menu
                  visible={showIntervalMenu}
                  onDismiss={() => setShowIntervalMenu(false)}
                  anchor={
                    <Button mode="outlined" onPress={() => setShowIntervalMenu(true)} style={{ marginBottom: spacing.sm }}>
                      {intervalTypes.find(i => i.value === selectedInterval)?.label || "Select Interval"}
                    </Button>
                  }>
                  {intervalTypes.map(interval => (
                    <Menu.Item
                      key={interval.value}
                      onPress={() => {
                        setSelectedInterval(interval.value);
                        handleIntervalChange("type", interval.value);
                        setShowIntervalMenu(false);
                      }}
                      title={interval.label}
                    />
                  ))}
                </Menu>
              </View>
            )}

            <FundDonations funds={funds} fundDonations={fundDonations} updatedFunction={handleFundDonationsChange} />

            <View style={{ marginTop: spacing.md }}>
              <Checkbox.Item
                label="Cover transaction fees"
                status={isChecked ? "checked" : "unchecked"}
                onPress={() => {
                  setIsChecked(!isChecked);
                  setTotal(calculateTotalWithFees(donation.amount || 0, !isChecked, transactionFee));
                }}
              />
              {transactionFee > 0 && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.xs }}>
                  Transaction fee: {CurrencyHelper.formatCurrency(transactionFee)}
                </Text>
              )}
            </View>

            <View style={{ marginTop: spacing.md }}>
              <Text variant="titleMedium">Total: {CurrencyHelper.formatCurrency(total)}</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.lg }}>
              <Button mode="outlined" onPress={handleCancel} style={{ flex: 1, marginRight: spacing.sm }}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleSave} style={{ flex: 1, marginLeft: spacing.sm }}>
                Continue
              </Button>
            </View>
          </>
        )}
      </Card.Content>

      <PreviewModal show={showPreviewModal} close={() => setShowPreviewModal(false)} donation={donation} paymentMethodName={getMethodLabel(pm.find(m => m.id === selectedMethod)!)} donationType={donationType} handleDonate={makeDonation} isChecked={isChecked} transactionFee={transactionFee} />
    </Card>
  );
}

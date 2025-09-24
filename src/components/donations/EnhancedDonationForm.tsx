import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Card, Text, TextInput, Button, Switch, Menu } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "@tanstack/react-query";
import { CardField, CardFieldInput, createPaymentMethod } from "@stripe/stripe-react-native";
import { ApiHelper, CurrencyHelper } from "../../helpers";
import { DonationHelper } from "../../helpers/DonationHelper";
import { FundInterface, StripeDonationInterface, StripePaymentMethod, PaymentGateway } from "../../interfaces";
import { useUser, useCurrentUserChurch } from "../../stores/useUserStore";
import { CacheHelper } from "../../helpers";
import { DonationComplete } from "./DonationComplete";
import DatePicker from "react-native-date-picker";
import dayjs from "dayjs";
import { DimensionHelper } from "@/helpers/DimensionHelper";

interface Props {
  paymentMethods: StripePaymentMethod[];
  customerId: string;
  gatewayData?: any[];
  updatedFunction: () => void;
}

export function EnhancedDonationForm({ paymentMethods: pm, customerId, gatewayData, updatedFunction }: Props) {
  const user = useUser();
  const currentUserChurch = useCurrentUserChurch();
  const person = currentUserChurch?.person;

  // Form state
  const [amount, setAmount] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [selectedFund, setSelectedFund] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedInterval, setSelectedInterval] = useState<string>("one_month");
  const [coverFees, setCoverFees] = useState<boolean>(false);
  const [transactionFee, setTransactionFee] = useState<number>(0);
  const [showComplete, setShowComplete] = useState<boolean>(false);
  const [completionData, setCompletionData] = useState<{ amount: string, isRecurring: boolean, interval: string }>({ amount: "", isRecurring: false, interval: "" });

  // Menu visibility
  const [showFundMenu, setShowFundMenu] = useState(false);
  const [showMethodMenu, setShowMethodMenu] = useState(false);
  const [showIntervalMenu, setShowIntervalMenu] = useState(false);

  // Guest user fields
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details>();
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());

  // Church data for non-auth users
  const [churchData, setChurchData] = useState<any>(null);

  // Determine church ID for funds query
  const churchId = currentUserChurch?.church?.id || "";

  // Use react-query for funds
  const { data: funds = [] } = useQuery<FundInterface[]>({
    queryKey: [`/funds/churchId/${churchId}`, "GivingApi"],
    enabled: !!churchId,
    placeholderData: [],
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  });

  // Fetch church data for non-auth users (similar to AppHelper)
  useEffect(() => {
    if (churchId && !churchData) {
      ApiHelper.get("/churches/" + churchId, "MembershipApi").then((data: any) => {
        setChurchData(data);
      }).catch((error: any) => {
        console.error("Failed to fetch church data:", error);
      });
    }
  }, [churchId, churchData]);

  // Initialize defaults
  useEffect(() => {
    if (funds.length > 0 && !selectedFund) {
      setSelectedFund(funds[0].id);
    }
  }, [funds, selectedFund]);

  useEffect(() => {
    if (pm.length > 0 && !selectedMethod) {
      setSelectedMethod(pm[0].id);
    }
  }, [pm, selectedMethod]);

  // Calculate transaction fee when amount or payment method changes
  useEffect(() => {
    const calculateFee = async () => {
      const amountNumber = parseFloat(amount || "0");
      if (amountNumber > 0) {
        // Calculate fee even if selectedMethod is empty (for non-auth users)
        const fee = await getTransactionFee(amountNumber);
        setTransactionFee(fee);
      } else {
        setTransactionFee(0);
      }
    };
    calculateFee();
  }, [amount, selectedMethod]);

  const intervalTypes = [
    { label: "Weekly", value: "one_week" },
    { label: "Monthly", value: "one_month" },
    { label: "Quarterly", value: "three_month" },
    { label: "Annually", value: "one_year" }
  ];

  const calculateTotal = () => {
    const baseAmount = parseFloat(amount || "0");
    if (coverFees && baseAmount > 0) {
      return baseAmount + transactionFee;
    }
    return baseAmount;
  };

  const getTransactionFee = async (amount: number) => {
    if (amount > 0) {
      const selectedPaymentMethod = pm.find(p => p.id === selectedMethod);
      let requestData: any = { amount };

      if (selectedPaymentMethod?.type === "paypal") {
        requestData.provider = "paypal";
      } else {
        // For non-auth users or when no payment method is selected, default to creditCard
        const dt = selectedPaymentMethod?.type === "card" ? "creditCard" :
          selectedPaymentMethod?.type === "bank" ? "ach" :
            "creditCard"; // Default for non-auth users
        requestData.type = dt;
      }

      try {
        const response = await ApiHelper.post("/donate/fee?churchId=" + churchId, requestData, "GivingApi");
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
    if (!method) return "Select Payment Method";
    return `${method.name} ending in ${method.last4}`;
  };

  const getFundLabel = (fundId: string) => {
    const fund = funds.find(f => f.id === fundId);
    return fund ? fund.name : "Select Fund";
  };

  const getIntervalLabel = (value: string) => {
    const interval = intervalTypes.find(i => i.value === value);
    return interval ? interval.label : "Monthly";
  };

  const handleGive = async () => {
    try {
      const donationAmount = parseFloat(amount);

      if (!donationAmount || donationAmount < 0.5) {
        Alert.alert("Invalid Amount", "Donation amount must be at least $0.50");
        return;
      }

      if (!selectedFund) {
        Alert.alert("Select Fund", "Please select a fund for your donation");
        return;
      }

      const total = calculateTotal();
      const selectedFundObj = funds.find(f => f.id === selectedFund);

      const donation: StripeDonationInterface = {
        id: selectedMethod,
        type: pm.find(p => p.id === selectedMethod)?.type || "card",
        customerId: customerId,
        person: {
          id: person?.id || "",
          email: person ? user?.email || "" : email,
          name: person ? `${user?.firstName} ${user?.lastName}` : `${firstName} ${lastName}`
        },
        amount: total,
        funds: [
          {
            id: selectedFund,
            amount: donationAmount,
            name: selectedFundObj?.name || ""
          }
        ],
        billing_cycle_anchor: Number(startDate) || +new Date(),
        interval: isRecurring
          ? {
            interval_count: getIntervalCount(selectedInterval),
            interval: getIntervalType(selectedInterval)
          }
          : undefined,
        church: {
          subDomain: CacheHelper.church?.subDomain || ""
        }
      };


      if (!currentUserChurch?.person?.id) {
        await handleGuestDonation(donation);
      } else {
        // For authenticated users, add gatewayId and other required fields
        const gateway = gatewayData && gatewayData.length > 0 ? gatewayData[0] : null;
        const enhancedDonation = {
          ...donation,
          gatewayId: gateway?.id,
          churchId: churchId || CacheHelper.church?.id,
          notes: "",
          church: {
            name: churchData?.name || currentUserChurch?.church?.name || CacheHelper.church?.name,
            subDomain: churchData?.subDomain || currentUserChurch?.church?.subDomain || CacheHelper.church?.subDomain,
            churchURL: `https://${churchData?.subDomain || currentUserChurch?.church?.subDomain || CacheHelper.church?.subDomain}.staging.b1.church`
          }
        };
        await makeDonation(enhancedDonation);
      }
    } catch (error) {
      console.error("Donation error:", error);
      Alert.alert("Error", "Failed to process donation. Please try again.");
    }
  };

  const getIntervalCount = (interval: string) => {
    switch (interval) {
      case "one_week":
        return 1;
      case "one_month":
        return 1;
      case "three_month":
        return 3;
      case "one_year":
        return 1;
      default:
        return 1;
    }
  };

  const getIntervalType = (interval: string) => {
    switch (interval) {
      case "one_week":
        return "week";
      case "one_month":
        return "month";
      case "three_month":
        return "month";
      case "one_year":
        return "year";
      default:
        return "month";
    }
  };

  const handleGuestDonation = async (donation: StripeDonationInterface) => {
    // Create user and person first
    await ApiHelper.post("/users/loadOrCreate", { userEmail: email, firstName, lastName }, "MembershipApi");

    const personData = {
      churchId: churchId || CacheHelper.church?.id || "",
      firstName,
      lastName,
      email
    };
    const personResult = await ApiHelper.post("/people/loadOrCreate", personData, "MembershipApi");

    // Create payment method
    const stripePaymentMethod = await createPaymentMethod({
      paymentMethodType: "Card",
      ...cardDetails
    });

    if (stripePaymentMethod.error) {
      throw new Error(stripePaymentMethod.error.message);
    }

    // Call addcard to get customerId (like AppHelper does)
    const pm = {
      id: stripePaymentMethod.paymentMethod.id,
      personId: personResult.id,
      email: email,
      name: `${firstName} ${lastName}`,
      churchId: churchId || CacheHelper.church?.id || ""
    };

    const result = await ApiHelper.post("/paymentmethods/addcard", pm, "GivingApi");

    if (result?.raw?.message) {
      throw new Error(result.raw.message);
    }


    // Create donation object with data from addcard response
    const gateway = gatewayData && gatewayData.length > 0 ? gatewayData[0] : null;
    const updatedDonation = {
      amount: donation.amount,
      id: result.paymentMethod?.id || "",
      customerId: result.customerId || "",
      type: result.paymentMethod?.type || "card",
      gatewayId: gateway?.id, // Add gatewayId as required by API
      churchId: churchId || CacheHelper.church?.id,
      person: {
        id: personResult.id,
        email: email,
        name: `${firstName} ${lastName}`
      },
      notes: "", // Add notes field like AppHelper
      funds: donation.funds || [],
      billing_cycle_anchor: donation.billing_cycle_anchor,
      interval: donation.interval,
      church: {
        name: churchData?.name || currentUserChurch?.church?.name || CacheHelper.church?.name,
        subDomain: churchData?.subDomain || currentUserChurch?.church?.subDomain || CacheHelper.church?.subDomain,
        churchURL: `https://${churchData?.subDomain || currentUserChurch?.church?.subDomain || CacheHelper.church?.subDomain}.staging.b1.church`
      }
    };

    await makeDonation(updatedDonation);
  };

  const makeDonation = async (donation: StripeDonationInterface) => {
    const endpoint = isRecurring ? "/donate/subscribe/" : "/donate/charge/";
    const result = await ApiHelper.post(endpoint, donation, "GivingApi");

    if (result?.status === "succeeded" || result?.status === "pending" || result?.status === "active") {
      // Store completion data
      setCompletionData({
        amount: CurrencyHelper.formatCurrency(calculateTotal()),
        isRecurring: isRecurring,
        interval: selectedInterval
      });

      // Reset form
      setAmount("");
      setIsRecurring(false);
      setCoverFees(false);
      setEmail("");
      setFirstName("");
      setLastName("");

      // Show completion screen
      setShowComplete(true);
    } else if (result?.raw?.message) {
      throw new Error(result.raw.message);
    }
  };

  if (showComplete) {
    return (
      <DonationComplete
        amount={completionData.amount}
        isRecurring={completionData.isRecurring}
        interval={completionData.interval}
        onDone={() => {
          setShowComplete(false);
          updatedFunction();
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Amount Input */}
      <View style={styles.amountSection}>
        <Text variant="titleMedium" style={styles.amountLabel}>
          Gift Amount
        </Text>
        <TextInput mode="outlined" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.amountInput} contentStyle={styles.amountInputText} placeholder="0.00" left={<TextInput.Icon icon={() => <Text style={styles.dollarSign}>$</Text>} />} outlineStyle={styles.amountInputOutline} onFocus={() => { if (amount === "0.00" || amount === "0" || parseFloat(amount || "0") === 0) setAmount(""); }} />
      </View>

      {/* Guest User Fields */}
      {!currentUserChurch?.person?.id && (
        <Card style={styles.guestCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.guestTitle}>
              Your Information
            </Text>
            <TextInput mode="outlined" label="Email" value={email} onChangeText={setEmail} style={styles.guestInput} />
            <View style={styles.nameRow}>
              <TextInput mode="outlined" label="First Name" value={firstName} onChangeText={setFirstName} style={[styles.guestInput, styles.nameInput]} />
              <TextInput mode="outlined" label="Last Name" value={lastName} onChangeText={setLastName} style={[styles.guestInput, styles.nameInput]} />
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Fund Selection */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Give To
          </Text>
          <Menu
            visible={showFundMenu}
            onDismiss={() => setShowFundMenu(false)}
            anchor={
              <TouchableOpacity style={styles.selector} onPress={() => setShowFundMenu(true)}>
                <Text variant="bodyLarge" style={styles.selectorText}>
                  {getFundLabel(selectedFund)}
                </Text>
                <MaterialIcons name="expand-more" size={24} color="#9E9E9E" />
              </TouchableOpacity>
            }>
            {funds.map(fund => (
              <Menu.Item
                key={fund.id}
                onPress={() => {
                  setSelectedFund(fund.id);
                  setShowFundMenu(false);
                }}
                title={fund.name}
              />
            ))}
          </Menu>
        </Card.Content>
      </Card>

      {/* Recurring Toggle */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.switchRow}>
            <View style={styles.switchContent}>
              <Text variant="titleMedium" style={styles.switchTitle}>
                Make this recurring
              </Text>
              <Text variant="bodyMedium" style={styles.switchSubtitle}>
                Set up automatic giving
              </Text>
            </View>
            <Switch value={isRecurring} onValueChange={setIsRecurring} thumbColor={isRecurring ? "#0D47A1" : "#f4f3f4"} trackColor={{ false: "#767577", true: "#0D47A1" }} />
          </View>

          {isRecurring && (
            <View style={styles.intervalSection}>
              <View style={{ width: DimensionHelper.wp(35) }}>
                <Text variant="titleSmall" style={styles.intervalLabel}>
                  Frequency
                </Text>
                <Menu
                  visible={showIntervalMenu}
                  onDismiss={() => setShowIntervalMenu(false)}
                  anchor={
                    <TouchableOpacity style={styles.selector} onPress={() => setShowIntervalMenu(true)}>
                      <Text variant="bodyLarge" style={styles.selectorText}>
                        {getIntervalLabel(selectedInterval)}
                      </Text>
                      <MaterialIcons name="expand-more" size={24} color="#9E9E9E" />
                    </TouchableOpacity>
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
              </View>
              <View style={{ width: DimensionHelper.wp(35) }}>
                <Text variant="titleSmall" style={styles.intervalLabel}>
                  Start Date
                </Text>
                <Button mode="outlined" onPress={() => setOpenStartPicker(true)} style={styles.dateTimeButton}>
                  <Text style={styles.dateTimeText}>{dayjs(startDate).format("MMM DD, YYYY")}</Text>
                </Button>
                <DatePicker
                  modal
                  open={openStartPicker}
                  date={startDate}
                  mode={"date"}
                  onConfirm={date => {
                    setOpenStartPicker(false);
                    setStartDate(date);
                  }}
                  onCancel={() => setOpenStartPicker(false)}
                />
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Payment Method */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Payment Method
          </Text>

          {pm.length > 0 ? (
            <Menu
              visible={showMethodMenu}
              onDismiss={() => setShowMethodMenu(false)}
              anchor={
                <TouchableOpacity style={styles.selector} onPress={() => setShowMethodMenu(true)}>
                  <Text variant="bodyLarge" style={styles.selectorText}>
                    {getMethodLabel(pm.find(m => m.id === selectedMethod)!)}
                  </Text>
                  <MaterialIcons name="expand-more" size={24} color="#9E9E9E" />
                </TouchableOpacity>
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
          ) : (
            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: "4242 4242 4242 4242" }}
              cardStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#E0E0E0",
                textColor: "#3c3c3c"
              }}
              style={styles.cardField}
              onCardChange={details => setCardDetails(details)}
            />
          )}
        </Card.Content>
      </Card>

      {/* Transaction Fee */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.switchRow}>
            <View style={styles.switchContent}>
              <Text variant="titleMedium" style={styles.switchTitle}>
                Cover transaction fees
              </Text>
              <Text variant="bodyMedium" style={styles.switchSubtitle}>
                Add {CurrencyHelper.formatCurrency(transactionFee)} to cover processing costs
              </Text>
            </View>
            <Switch value={coverFees} onValueChange={setCoverFees} thumbColor={coverFees ? "#0D47A1" : "#f4f3f4"} trackColor={{ false: "#767577", true: "#0D47A1" }} />
          </View>
        </Card.Content>
      </Card>

      {/* Total */}
      <View style={styles.totalSection}>
        <Text variant="headlineSmall" style={styles.totalLabel}>
          Total: {CurrencyHelper.formatCurrency(calculateTotal())}
        </Text>
      </View>

      {/* Give Button */}
      <Button mode="contained" onPress={handleGive} style={styles.giveButton} labelStyle={styles.giveButtonText} disabled={!amount || parseFloat(amount) < 0.5} buttonColor="#0D47A1" textColor="#FFFFFF">
        {isRecurring ? `Give ${CurrencyHelper.formatCurrency(calculateTotal())} ${getIntervalLabel(selectedInterval)}` : `Give ${CurrencyHelper.formatCurrency(calculateTotal())}`}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16
  },

  // Amount Section
  amountSection: {
    alignItems: "center",
    marginBottom: 8
  },
  amountLabel: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 16
  },
  amountInput: {
    width: "100%",
    backgroundColor: "#FFFFFF"
  },
  amountInputText: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#0D47A1"
  },
  amountInputOutline: {
    borderWidth: 2,
    borderColor: "#0D47A1",
    borderRadius: 12
  },
  dollarSign: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0D47A1"
  },

  // Guest User Section
  guestCard: {
    borderRadius: 16,
    elevation: 2
  },
  guestTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 16
  },
  guestInput: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF"
  },
  nameRow: {
    flexDirection: "row",
    gap: 12
  },
  nameInput: {
    flex: 1
  },

  // Section Cards
  sectionCard: {
    borderRadius: 16,
    elevation: 2,
    backgroundColor: "#FFFFFF"
  },
  sectionTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 16
  },

  // Selectors
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F6F6F8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },
  selectorText: {
    color: "#3c3c3c",
    fontWeight: "500"
  },

  // Switch Rows
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  switchContent: {
    flex: 1,
    marginRight: 16
  },
  switchTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 4
  },
  switchSubtitle: {
    color: "#9E9E9E",
    fontSize: 14
  },

  // Interval Section
  intervalSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  intervalLabel: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 12
  },

  // Card Field
  cardField: {
    height: 50,
    marginVertical: 8
  },

  // Total Section
  totalSection: {
    alignItems: "center",
    paddingVertical: 16
  },
  totalLabel: {
    color: "#0D47A1",
    fontWeight: "800"
  },

  // Give Button
  giveButton: {
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  giveButtonText: {
    fontWeight: "700",
    fontSize: 18
  },
  dateTimeButton: {
    alignItems: "center",
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: "#F6F6F8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },
  dateTimeText: {
    color: "#3c3c3c",
    fontSize: 14,
  },
});

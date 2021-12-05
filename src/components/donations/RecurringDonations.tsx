import React, { useState, useEffect } from "react";
import { Image, ActivityIndicator, Text, ScrollView, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useIsFocused } from "@react-navigation/native";
import Dialog, { DialogContent, ScaleAnimation } from "react-native-popup-dialog";
import Icon from "react-native-vector-icons/FontAwesome";
import DropDownPicker from "react-native-dropdown-picker";
import Images from "../../utils/Images";
import { globalStyles, ApiHelper, DateHelper, CurrencyHelper, UserHelper } from "../../helper";
import { DisplayBox } from "../";
import { StripePaymentMethod, SubscriptionInterface } from "../../interfaces";
import Colors from "../../utils/Colors";

interface Props {
  customerId: string;
  paymentMethods: StripePaymentMethod[];
  updatedFunction: () => void;
}

export function RecurringDonations({ customerId, paymentMethods: pm, updatedFunction }: Props) {
  const [subscriptions, setSubscriptions] = React.useState<SubscriptionInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionInterface>({} as SubscriptionInterface);
  const [paymentMethods, setPaymentMethods] = useState<{ label: string; value: string }[]>([]);
  const [isMethodsDropdownOpen, setIsMethodsDropdownOpen] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [intervalNumber, setIntervalNumber] = useState<any>("");
  const [isIntervalDropdownOpen, setIsIntervalDropdownOpen] = useState<boolean>(false);
  const [intervalTypes, setIntervalTypes] = useState<{ label: string; value: string }[]>([
    { label: "Day(s)", value: "day" },
    { label: "Week(s)", value: "week" },
    { label: "Month(s)", value: "month" },
    { label: "Year(s)", value: "year" },
  ]);
  const [selectedInterval, setSelectedInterval] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const isFocused = useIsFocused();
  const person = UserHelper.person;

  const loadDonations = () => {
    if (customerId) {
      setIsLoading(true);
      ApiHelper.get("/customers/" + customerId + "/subscriptions", "GivingApi").then((subResult) => {
        const subs: SubscriptionInterface[] = [];
        const requests = subResult.data?.map((s: any) =>
          ApiHelper.get("/subscriptionfunds?subscriptionId=" + s.id, "GivingApi").then((subFunds) => {
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

  useEffect(() => {
    setPaymentMethods(pm.map((p) => ({ label: `${p.name} ****${p.last4}`, value: p.id })));
  }, [pm]);

  const getRow = () => {
    return subscriptions?.map((sub) => {
      const total = CurrencyHelper.formatCurrency(sub.plan.amount / 100);
      let interval = sub.plan.interval_count + " " + sub.plan.interval;
      const intervalUi = sub.plan.interval_count > 1 ? interval + "s" : sub.plan.interval;
      return (
        <View key={sub.id}>
          <View style={globalStyles.cardListSeperator} />
          <View style={{ ...globalStyles.donationRowContainer, ...globalStyles.donationListView }}>
            <Text style={{ ...globalStyles.donationRowText }}>
              {DateHelper.prettyDate(new Date(sub.billing_cycle_anchor * 1000))}
            </Text>
            <Text style={{ ...globalStyles.donationRowText }}>
              {total} / {intervalUi}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowModal(true);
                setSelectedSubscription(sub);
                setSelectedMethod(sub.default_payment_method || sub.default_source);
                setIntervalNumber(sub.plan.interval_count);
                setSelectedInterval(sub.plan.interval);
              }}
              style={{ marginLeft: wp("6%") }}
            >
              <FontAwesome5 name={"pencil-alt"} style={{ color: Colors.app_color }} size={wp("5.5%")} />
            </TouchableOpacity>
          </View>
        </View>
      );
    });
  };

  const handleDelete = () => {
    Alert.alert("Are you sure?", "This will permantly delete and stop the recurring payments", [
      {
        text: "Cancel",
        onPress: () => { },
        style: "cancel",
      },
      {
        text: "OK",
        onPress: async () => {
          try {
            setIsDeleting(true);
            let promises = [];
            promises.push(ApiHelper.delete("/subscriptions/" + selectedSubscription.id, "GivingApi"));
            promises.push(ApiHelper.delete("/subscriptionfunds/subscription/" + selectedSubscription.id, "GivingApi"));
            Promise.all(promises).then(async () => {
              setIsDeleting(false);
              setShowModal(false);
              await updatedFunction();
              loadDonations();
            });
          } catch (err) {
            setIsDeleting(false);
            Alert.alert("Error in deleting the method");
          }
        },
      },
    ]);
  };

  const handleSave = () => {
    setIsSaving(true);
    const selectedSubsCopy = { ...selectedSubscription };

    let methods = pm.find((pm: StripePaymentMethod) => pm.id === selectedMethod);
    if (!methods) {
      methods = pm[0];
    }
    selectedSubsCopy.default_payment_method = methods?.type === "card" ? selectedMethod : "";
    selectedSubsCopy.default_source = methods?.type === "bank" ? selectedMethod : "";
    selectedSubsCopy.plan.interval_count = Number(intervalNumber);
    selectedSubsCopy.plan.interval = selectedInterval;
    ApiHelper.post("/subscriptions", [selectedSubsCopy], "GivingApi").then(async () => {
      setIsSaving(false);
      setShowModal(false);
      await updatedFunction();
      loadDonations();
    });
  };

  const getFunds = (subscription: SubscriptionInterface) => {
    let result = [];

    subscription?.funds?.forEach((fund: any) => {
      result.push(
        <View
          key={subscription.id + fund.id}
          style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: wp("40%") }}
        >
          <Text style={{ width: wp("30%"), overflow: "hidden" }}>{fund.name}</Text>
          <Text>{CurrencyHelper.formatCurrency(fund.amount)}</Text>
        </View>
      );
    });
    const total = subscription?.plan?.amount / 100;
    result.push(
      <View
        key={subscription.id + "-total"}
        style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: wp("40%") }}
      >
        <Text style={{ width: wp("30%"), overflow: "hidden" }}>Total</Text>
        <Text>{CurrencyHelper.formatCurrency(total)}</Text>
      </View>
    );
    return result;
  };

  const donationsTable = (
    <View style={{ ...globalStyles.donationContainer, marginVertical: wp("5%") }}>
      <View style={{ ...globalStyles.donationRowContainer, marginBottom: wp("5%") }}>
        <Text style={{ ...globalStyles.donationRowText, fontWeight: "bold" }}>Start Date</Text>
        <Text style={{ ...globalStyles.donationRowText, fontWeight: "bold" }}>Amount</Text>
      </View>
      {getRow()}
    </View>
  );

  const content =
    subscriptions.length > 0 ? (
      donationsTable
    ) : (
      <Text style={globalStyles.paymentDetailText}>
        Recurring Donations will appear once a donation has been entered.
      </Text>
    );
  return (
    <>
      <Dialog
        onTouchOutside={() => setShowModal(false)}
        width={0.86}
        visible={showModal}
        dialogAnimation={new ScaleAnimation()}
      >
        <DialogContent>
          <View style={globalStyles.donationPreviewView}>
            <Text style={globalStyles.donationText}>Edit Subscription</Text>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
              }}
              style={globalStyles.donationCloseBtn}
            >
              <Icon name={"close"} style={globalStyles.closeIcon} size={wp("6%")} />
            </TouchableOpacity>
          </View>
          {/* <ScrollView> */}
          <View style={globalStyles.previewView}>
            <Text style={globalStyles.previewTitleText}>Start Date:</Text>
            <Text style={{ ...globalStyles.previewDetailText }}>
              {DateHelper.prettyDate(
                new Date(selectedSubscription && selectedSubscription.billing_cycle_anchor * 1000)
              )}
            </Text>
          </View>
          <View style={globalStyles.previewView}>
            <Text style={globalStyles.previewTitleText}>Amount:</Text>
            <View style={{ display: "flex" }}>{getFunds(selectedSubscription)}</View>
          </View>
          <View style={globalStyles.previewView}>
            <Text style={globalStyles.previewTitleText}>Interval:</Text>
            <Text style={{ ...globalStyles.previewDetailText }}>Every {getInterval(selectedSubscription)}</Text>
          </View>
          <Text style={{ ...globalStyles.previewTitleText, marginTop: wp("4%") }}>Method:</Text>
          <View style={{ width: wp("100%"), marginBottom: wp("12%") }}>
            <DropDownPicker
              listMode="SCROLLVIEW"
              open={isMethodsDropdownOpen}
              items={paymentMethods}
              value={selectedMethod}
              setOpen={setIsMethodsDropdownOpen}
              setValue={setSelectedMethod}
              setItems={setPaymentMethods}
              containerStyle={{
                ...globalStyles.containerStyle,
                height: isMethodsDropdownOpen ? paymentMethods.length * wp("12%") : wp("1%"),
                width: wp("76%"),
                marginHorizontal: wp("0%"),
              }}
              style={globalStyles.dropDownMainStyle}
              labelStyle={globalStyles.labelStyle}
              listItemContainerStyle={globalStyles.itemStyle}
              dropDownContainerStyle={{ ...globalStyles.dropDownStyle, width: wp("76%"), marginHorizontal: wp("0%") }}
              scrollViewProps={{ scrollEnabled: true }}
              dropDownDirection="BOTTOM"
            />
          </View>
          <Text style={{ ...globalStyles.previewTitleText, marginTop: wp("4%"), width: wp("40%") }}>
            Interval Number:
          </Text>
          <TextInput
            style={{ ...globalStyles.intervalInput, width: wp("76%"), marginLeft: wp("0%") }}
            keyboardType="number-pad"
            value={intervalNumber?.toString()}
            onChangeText={(text) => setIntervalNumber(text)}
          />
          <Text style={{ ...globalStyles.previewTitleText, marginTop: wp("4%") }}>Interval Type</Text>
          <View style={{ width: wp("100%"), marginBottom: wp("12%") }}>
            <DropDownPicker
              listMode="SCROLLVIEW"
              open={isIntervalDropdownOpen}
              items={intervalTypes}
              value={selectedInterval}
              setOpen={setIsIntervalDropdownOpen}
              setValue={setSelectedInterval}
              setItems={setIntervalTypes}
              containerStyle={{
                ...globalStyles.containerStyle,
                height: isIntervalDropdownOpen ? intervalTypes.length * wp("12%") : wp("1%"),
                width: wp("76%"),
                marginHorizontal: wp("0%"),
              }}
              style={globalStyles.dropDownMainStyle}
              labelStyle={globalStyles.labelStyle}
              listItemContainerStyle={globalStyles.itemStyle}
              dropDownContainerStyle={{ ...globalStyles.dropDownStyle, width: wp("76%"), marginHorizontal: wp("0%") }}
              scrollViewProps={{ scrollEnabled: true }}
              dropDownDirection="BOTTOM"
            />
          </View>
          {/* </ScrollView> */}
          <View style={globalStyles.popupBottomContainer}>
            <TouchableOpacity
              style={{
                ...globalStyles.popupButton,
                backgroundColor: "#6C757D",
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                width: wp("26%"),
              }}
              onPress={() => setShowModal(false)}
              disabled={isSaving || isDeleting}
            >
              <Text style={globalStyles.popupButonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ ...globalStyles.popupButton, backgroundColor: "red", borderRadius: 0, width: wp("25%") }}
              onPress={() => handleDelete()}
              disabled={isSaving || isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="white" animating={isDeleting} />
              ) : (
                <Text style={globalStyles.popupButonText}>Delete</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                ...globalStyles.popupButton,
                backgroundColor: Colors.button_bg,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                width: wp("26%"),
              }}
              onPress={() => handleSave()}
              disabled={isSaving || isDeleting}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="white" animating={isSaving} />
              ) : (
                <Text style={globalStyles.popupButonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </DialogContent>
      </Dialog>
      <DisplayBox
        title="Recurring Donations"
        headerIcon={<Image source={Images.ic_give} style={globalStyles.donationIcon} />}
      >
        {isLoading ? (
          <ActivityIndicator size="large" style={{ margin: wp("2%") }} color="gray" animating={isLoading} />
        ) : (
          content
        )}
      </DisplayBox>
    </>
  );
}

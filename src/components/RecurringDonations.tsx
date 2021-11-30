import React, { useState, useEffect } from "react";
import { Image, ActivityIndicator, Text, ScrollView, View, TouchableOpacity } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useIsFocused } from "@react-navigation/native";
import Dialog, { DialogContent, ScaleAnimation } from "react-native-popup-dialog";
import Icon from "react-native-vector-icons/FontAwesome";
import Images from "../utils/Images";
import { globalStyles, ApiHelper, DateHelper, CurrencyHelper, Userhelper } from "../helper";
import { DisplayBox } from ".";
import { SubscriptionInterface } from "../interfaces";
import Colors from "../utils/Colors";

interface Props {
  customerId: string;
}

export function RecurringDonations({ customerId }: Props) {
  const [subscriptions, setSubscriptions] = React.useState<SubscriptionInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionInterface>({} as SubscriptionInterface);
  const isFocused = useIsFocused();
  const person = Userhelper.person;

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

  const getFunds = (subscription: SubscriptionInterface) => {
    let result = [];
    subscription.funds.forEach((fund: any) => {
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
    const total = subscription.plan.amount / 100;
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
    <ScrollView nestedScrollEnabled={true}>
      <View style={{ ...globalStyles.donationContainer, marginVertical: wp("5%") }}>
        <View style={{ ...globalStyles.donationRowContainer, marginBottom: wp("5%") }}>
          <Text style={{ ...globalStyles.donationRowText, fontWeight: "bold" }}>Start Date</Text>
          <Text style={{ ...globalStyles.donationRowText, fontWeight: "bold" }}>Amount</Text>
        </View>
        {getRow()}
      </View>
    </ScrollView>
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
          <ScrollView>
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
          </ScrollView>
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

import React, { useState, useEffect } from "react";
import { Image, ActivityIndicator, Text, ScrollView, View, TouchableOpacity } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useIsFocused } from "@react-navigation/native";
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
            setIsLoading(false)
          })
        );
      });
    }
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
            <TouchableOpacity onPress={() => {}} style={{ marginLeft: wp("6%") }}>
              <FontAwesome5 name={"pencil-alt"} style={{ color: Colors.app_color }} size={wp("5.5%")} />
            </TouchableOpacity>
          </View>
        </View>
      );
    });
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
      <Text style={globalStyles.paymentDetailText}>Recurring Donations will appear once a donation has been entered.</Text>
    );
  return (
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
  );
}

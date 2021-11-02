import React, { useEffect, useState } from "react";
import { Image, Text, ActivityIndicator } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useIsFocused } from "@react-navigation/native";
import { DisplayBox } from ".";
import Images from "../utils/Images";
import { globalStyles, ApiHelper, Userhelper } from "../helper";
import { DonationInterface } from "../interfaces";

export function Donations() {
  const [donations, setDonations] = useState<DonationInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isFocused = useIsFocused();
  const person = Userhelper.person;

  const loadDonations = () => {
    console.log("here")
    setIsLoading(true);
    ApiHelper.get("/donations?personId=" + person.id, "GivingApi")
      .then((data) => setDonations(data))
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (isFocused) {
      loadDonations();
    }
  }, [isFocused]);

  useEffect(loadDonations, []);

  const donationsTable = (<Text>Something</Text>)

  const content =
    donations.length > 0 ? (
      donationsTable
    ) : (
      <Text style={globalStyles.paymentDetailText}>Donations will appear once a donation has been entered.</Text>
    );

  return (
    <DisplayBox title="Donations" headerIcon={<Image source={Images.ic_give} style={globalStyles.donationIcon} />}>
      {isLoading ? (
        <ActivityIndicator size="large" style={{ margin: wp("2%") }} color="gray" animating={isLoading} />
      ) : (
        content
      )}
    </DisplayBox>
  );
}

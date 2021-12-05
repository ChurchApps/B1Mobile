import React, { useEffect, useState } from "react";
import { Image, Text, ActivityIndicator, ScrollView, View, TouchableOpacity } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useIsFocused } from "@react-navigation/native";
import Dialog, { DialogContent, ScaleAnimation } from "react-native-popup-dialog";
import Icon from "react-native-vector-icons/FontAwesome";
import { DisplayBox } from "../";
import Images from "../../utils/Images";
import { globalStyles, ApiHelper, UserHelper, DateHelper, CurrencyHelper } from "../../helper";
import { DonationInterface } from "../../interfaces";
import Colors from "../../utils/Colors";

export function Donations() {
  const [donations, setDonations] = useState<DonationInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDonationModal, setShowDonationModal] = useState<boolean>(false);
  const [selectedDonation, setSelectedDonation] = useState<DonationInterface>({});
  const isFocused = useIsFocused();
  const person = UserHelper.person;

  const loadDonations = () => {
    console.log("here");
    setIsLoading(true);
    ApiHelper.get("/donations?personId=" + person.id, "GivingApi")
      .then((data) => setDonations(data))
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (isFocused) {
      if (person) {
        loadDonations();
      }
    }
  }, [isFocused]);

  useEffect(loadDonations, []);

  const getRow = () => {
    return donations?.map((d) => (
      <View>
        <View style={globalStyles.cardListSeperator} />
        <View style={{ ...globalStyles.donationRowContainer, ...globalStyles.donationListView }}>
          <Text style={{ ...globalStyles.donationRowText }}>
            {DateHelper.prettyDate(new Date(d.donationDate || ""))}
          </Text>
          <Text style={{ ...globalStyles.donationRowText }}>{CurrencyHelper.formatCurrency(d.fund?.amount || 0)}</Text>
          <TouchableOpacity
            onPress={() => {
              setShowDonationModal(true);
              setSelectedDonation(d);
            }}
            style={{ marginLeft: wp("6%") }}
          >
            <FontAwesome5 name={"eye"} style={{ color: Colors.app_color }} size={wp("5.5%")} />
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  const donationsTable = (
    <ScrollView nestedScrollEnabled={true}>
      <View style={{ ...globalStyles.donationContainer, marginVertical: wp("5%") }}>
        <View style={{ ...globalStyles.donationRowContainer, marginBottom: wp("5%") }}>
          <Text style={{ ...globalStyles.donationRowText, fontWeight: "bold" }}>Date</Text>
          <Text style={{ ...globalStyles.donationRowText, fontWeight: "bold" }}>Amount</Text>
        </View>
        {getRow()}
      </View>
    </ScrollView>
  );

  const content =
    donations.length > 0 ? (
      donationsTable
    ) : (
      <Text style={globalStyles.paymentDetailText}>Donations will appear once a donation has been entered.</Text>
    );

  return (
    <>
      <Dialog
        onTouchOutside={() => setShowDonationModal(false)}
        width={0.86}
        visible={showDonationModal}
        dialogAnimation={new ScaleAnimation()}
      >
        <DialogContent>
          <View style={globalStyles.donationPreviewView}>
            <Text style={globalStyles.donationText}>Donation Details</Text>
            <TouchableOpacity
              onPress={() => {
                setShowDonationModal(false);
              }}
              style={globalStyles.donationCloseBtn}
            >
              <Icon name={"close"} style={globalStyles.closeIcon} size={wp("6%")} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View style={globalStyles.previewView}>
              <Text style={globalStyles.previewTitleText}>Date:</Text>
              <Text style={{ ...globalStyles.previewDetailText }}>
                {DateHelper.prettyDate(new Date(selectedDonation.donationDate || ""))}
              </Text>
            </View>
            <View style={globalStyles.previewView}>
              <Text style={globalStyles.previewTitleText}>Method:</Text>
              <Text style={{ ...globalStyles.previewDetailText }}>
                {selectedDonation.method} - {selectedDonation.methodDetails}
              </Text>
            </View>
            <View style={globalStyles.previewView}>
              <Text style={globalStyles.previewTitleText}>Fund:</Text>
              <Text style={{ ...globalStyles.previewDetailText }}>{selectedDonation.fund?.name}</Text>
            </View>
            <View style={globalStyles.previewView}>
              <Text style={globalStyles.previewTitleText}>Amount:</Text>
              <Text style={{ ...globalStyles.previewDetailText }}>
                {CurrencyHelper.formatCurrency(selectedDonation.fund?.amount || 0)}
              </Text>
            </View>
          </ScrollView>
        </DialogContent>
      </Dialog>
      <DisplayBox title="Donations" headerIcon={<Image source={Images.ic_give} style={globalStyles.donationIcon} />}>
        {isLoading ? (
          <ActivityIndicator size="large" style={{ margin: wp("2%") }} color="gray" animating={isLoading} />
        ) : (
          content
        )}
      </DisplayBox>
    </>
  );
}

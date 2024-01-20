import { DimensionHelper } from "@churchapps/mobilehelper";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { DisplayBox } from "../";
import { ApiHelper, Constants, CurrencyHelper, DateHelper, UserHelper, globalStyles } from "../../helpers";
import { DonationInterface } from "../../interfaces";
import { CustomModal } from "../modals/CustomModal";

export function Donations() {
  const [donations, setDonations] = useState<DonationInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDonationModal, setShowDonationModal] = useState<boolean>(false);
  const [selectedDonation, setSelectedDonation] = useState<DonationInterface>({});
  const isFocused = useIsFocused();
  const person = UserHelper.currentUserChurch?.person;

  const loadDonations = () => {
    if (person) {
      setIsLoading(true);
      ApiHelper.get("/donations?personId=" + person.id, "GivingApi")
        .then((data) => {
          if (Array.isArray(data)) setDonations(data);
        })
        .finally(() => {
          setIsLoading(false);
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

  useEffect(loadDonations, []);

  const getRow = () => {
    if (!donations) return <View></View>;
    else {
      return donations?.map((d) => (
        <View>
          <View style={globalStyles.cardListSeperator} />
          <View style={{ ...globalStyles.donationRowContainer, ...globalStyles.donationListView }}>
            <Text style={{ ...globalStyles.donationRowText }}>
              {DateHelper.prettyDate(new Date(d.donationDate || ""))}
            </Text>
            <Text style={{ ...globalStyles.donationRowText }}>
              {CurrencyHelper.formatCurrency(d.fund?.amount || 0)}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowDonationModal(true);
                setSelectedDonation(d);
              }}
              style={{ marginLeft: DimensionHelper.wp("6%") }}
            >
              <FontAwesome5 name={"eye"} style={{ color: Constants.Colors.app_color }} size={DimensionHelper.wp("5.5%")} />
            </TouchableOpacity>
          </View>
        </View>
      ));
    }
  };

  const donationsTable = (
    <ScrollView nestedScrollEnabled={true}>
      <View style={{ ...globalStyles.donationContainer, marginVertical: DimensionHelper.wp("5%") }}>
        <View style={{ ...globalStyles.donationRowContainer, marginBottom: DimensionHelper.wp("5%") }}>
          <Text style={{ ...globalStyles.donationRowText, fontWeight: "bold" }}>Date</Text>
          <Text style={{ ...globalStyles.donationRowText, fontWeight: "bold" }}>Amount</Text>
        </View>
        {getRow()}
      </View>
    </ScrollView>
  );

  const content =
    donations?.length > 0 ? (
      donationsTable
    ) : (
      <Text style={globalStyles.paymentDetailText}>Donations will appear once a donation has been entered.</Text>
    );

  return (
    <>
      <CustomModal width={DimensionHelper.wp(85)} isVisible={showDonationModal} close={() => setShowDonationModal(false)}>
        <View style={{ paddingHorizontal: DimensionHelper.wp(1) }}>
          <View style={globalStyles.donationPreviewView}>
            <Text style={globalStyles.donationText}>Donation Details</Text>
            <TouchableOpacity
              onPress={() => {
                setShowDonationModal(false);
              }}
              style={globalStyles.donationCloseBtn}
            >
              <Icon name={"close"} style={globalStyles.closeIcon} size={DimensionHelper.wp("6%")} />
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
        </View>
      </CustomModal>
      <DisplayBox
        title="Donations"
        headerIcon={<Image source={Constants.Images.ic_give} style={globalStyles.donationIcon} />}
      >
        {isLoading ? (
          <ActivityIndicator size="large" style={{ margin: DimensionHelper.wp("2%") }} color="gray" animating={isLoading} />
        ) : (
          content
        )}
      </DisplayBox>
    </>
  );
}

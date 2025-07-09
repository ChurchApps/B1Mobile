import React, { useEffect, useState } from "react";
import { ApiHelper, CurrencyHelper, DateHelper, UserHelper } from "../../../src/helpers";
import { DonationInterface } from "../../../src/interfaces";
import { useIsFocused } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { Card, IconButton, List, Portal, Modal, Text } from "react-native-paper";
import { useAppTheme } from "../../../src/theme";

export function Donations() {
  const [donations, setDonations] = useState<DonationInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDonationModal, setShowDonationModal] = useState<boolean>(false);
  const [selectedDonation, setSelectedDonation] = useState<DonationInterface>({});
  const isFocused = useIsFocused();
  const person = UserHelper.currentUserChurch?.person;
  const { spacing, theme } = useAppTheme();

  const loadDonations = () => {
    if (person) {
      setIsLoading(true);
      ApiHelper.get("/donations?personId=" + person.id, "GivingApi")
        .then(data => {
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

  const renderDonationItem = (donation: DonationInterface) => (
    <List.Item
      key={donation.id}
      title={DateHelper.prettyDate(new Date(donation.donationDate || ""))}
      description={donation.fund?.name}
      right={() => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text variant="bodyLarge" style={{ marginRight: spacing.md }}>
            {CurrencyHelper.formatCurrency(donation.fund?.amount || 0)}
          </Text>
          <IconButton
            icon="eye"
            size={20}
            onPress={() => {
              setShowDonationModal(true);
              setSelectedDonation(donation);
            }}
          />
        </View>
      )}
    />
  );

  const content =
    donations?.length > 0 ? (
      <List.Section>{donations.map(renderDonationItem)}</List.Section>
    ) : (
      <Text variant="bodyLarge" style={{ padding: spacing.md, textAlign: "center" }}>
        Donations will appear once a donation has been entered.
      </Text>
    );

  return (
    <>
      <Portal>
        <Modal
          visible={showDonationModal}
          onDismiss={() => setShowDonationModal(false)}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: spacing.md,
            margin: spacing.md,
            borderRadius: 8,
            maxHeight: "80%"
          }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
            <Text variant="titleLarge">Donation Details</Text>
            <IconButton icon="close" size={24} onPress={() => setShowDonationModal(false)} />
          </View>
          <ScrollView>
            <List.Section>
              <List.Item title="Date" description={DateHelper.prettyDate(new Date(selectedDonation.donationDate || ""))} />
              <List.Item title="Method" description={`${selectedDonation.method} - ${selectedDonation.methodDetails}`} />
              <List.Item title="Fund" description={selectedDonation.fund?.name} />
              <List.Item title="Amount" description={CurrencyHelper.formatCurrency(selectedDonation.fund?.amount || 0)} />
            </List.Section>
          </ScrollView>
        </Modal>
      </Portal>

      <Card>
        <Card.Title title="Donations" titleStyle={{ fontSize: 20, fontWeight: "600" }} left={props => <IconButton {...props} icon="history" size={24} iconColor={theme.colors.primary} style={{ margin: 0 }} />} />
        <Card.Content>{isLoading ? <ActivityIndicator size="large" style={{ margin: spacing.md }} /> : content}</Card.Content>
      </Card>
    </>
  );
}

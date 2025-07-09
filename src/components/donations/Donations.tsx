import React, { useState } from "react";
import { CurrencyHelper, DateHelper } from "../../../src/helpers";
import { DonationInterface } from "../../../src/interfaces";
import { useIsFocused } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { Card, IconButton, List, Portal, Modal, Text } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { useAppTheme } from "../../../src/theme";
import { useCurrentUserChurch } from "../../stores/useUserStore";

export function Donations() {
  const [showDonationModal, setShowDonationModal] = useState<boolean>(false);
  const [selectedDonation, setSelectedDonation] = useState<DonationInterface>({});
  const isFocused = useIsFocused();
  const currentUserChurch = useCurrentUserChurch();
  const person = currentUserChurch?.person;
  const { spacing, theme } = useAppTheme();

  // Use react-query for donations
  const { data: donations = [], isLoading } = useQuery<DonationInterface[]>({
    queryKey: [`/donations?personId=${person?.id}`, "GivingApi"],
    enabled: !!person?.id && !!currentUserChurch?.jwt && isFocused,
    placeholderData: [],
    staleTime: 2 * 60 * 1000, // 2 minutes - financial data should be relatively fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
    select: data => (Array.isArray(data) ? data : [])
  });

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

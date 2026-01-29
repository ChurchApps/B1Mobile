import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CurrencyHelper, DateHelper } from "../../../src/helpers";
import { DonationInterface } from "../../../src/interfaces";
import { useIsFocused } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, View, FlatList } from "react-native";
import { Card, IconButton, List, Portal, Modal, Text } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { useAppTheme } from "../../../src/theme";
import { useCurrentUserChurch } from "../../stores/useUserStore";

export function Donations() {
  const { t } = useTranslation();
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

  const renderDonationItem = useCallback(
    ({ item: donation }: { item: DonationInterface }) => (
      <List.Item
        title={DateHelper.prettyDate(new Date((donation.donationDate || "") + "T00:00:00"))}
        description={donation.status === "pending" ? `${donation.fund?.name} (Pending)` : donation.fund?.name}
        right={() => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text variant="bodyLarge" style={{ marginRight: spacing.md, color: donation.status === "pending" ? "#f59e0b" : undefined }}>
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
    ),
    [spacing.md, setShowDonationModal, setSelectedDonation]
  );

  const keyExtractor = useCallback((item: DonationInterface) => item.id?.toString() || "", []);

  const listData = useMemo(() => donations || [], [donations]);

  const content =
    listData.length > 0 ? (
      <FlatList
        data={listData}
        renderItem={renderDonationItem}
        keyExtractor={keyExtractor}
        initialNumToRender={10}
        windowSize={10}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
        getItemLayout={(data, index) => ({
          length: 72, // Estimated height of List.Item
          offset: 72 * index,
          index
        })}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    ) : (
      <Text variant="bodyLarge" style={{ padding: spacing.md, textAlign: "center" }}>
        {t("donations.noDonationsYet")}
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
            <Text variant="titleLarge">{t("donations.donationDetails")}</Text>
            <IconButton icon="close" size={24} onPress={() => setShowDonationModal(false)} />
          </View>
          <ScrollView>
            <List.Section>
              <List.Item title={t("donations.date")} description={DateHelper.prettyDate(new Date((selectedDonation.donationDate || "") + "T00:00:00"))} />
              <List.Item title={t("donations.method")} description={`${selectedDonation.method} - ${selectedDonation.methodDetails}`} />
              <List.Item title={t("donations.fund")} description={selectedDonation.fund?.name} />
              <List.Item title={t("donations.amount")} description={CurrencyHelper.formatCurrency(selectedDonation.fund?.amount || 0)} />
              {selectedDonation.status === "pending" && (
                <List.Item
                  title={t("donations.status")}
                  description="Pending - ACH transfers typically take 4-5 business days"
                  descriptionStyle={{ color: "#f59e0b" }}
                />
              )}
            </List.Section>
          </ScrollView>
        </Modal>
      </Portal>

      <Card>
        <Card.Title title={t("donations.donations")} titleStyle={{ fontSize: 20, fontWeight: "600" }} left={props => <IconButton {...props} icon="history" size={24} iconColor={theme.colors.primary} style={{ margin: 0 }} />} />
        <Card.Content>{isLoading ? <ActivityIndicator size="large" style={{ margin: spacing.md }} /> : content}</Card.Content>
      </Card>
    </>
  );
}

import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Card, Button, SegmentedButtons } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Print from "expo-print";
import { ApiHelper, DonationInterface, FundDonationInterface, FundInterface, DateHelper } from "@churchapps/helpers";
import { useTranslation } from "react-i18next";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import { generateStatementHtml } from "./DonationStatementHtml";
import { useThemeColors } from "../../theme";

export function PrintStatementButton() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const currentUserChurch = useCurrentUserChurch();
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();
  const [yearOffset, setYearOffset] = useState("0");

  const handlePrint = async () => {
    setLoading(true);
    try {
      const year = currentYear - parseInt(yearOffset);
      const [funds, fundDonations, allDonations] = await Promise.all([
        ApiHelper.get("/funds", "GivingApi") as Promise<FundInterface[]>,
        ApiHelper.get("/fundDonations/my", "GivingApi") as Promise<FundDonationInterface[]>,
        ApiHelper.get("/donations/my", "GivingApi") as Promise<DonationInterface[]>
      ]);

      const donations = allDonations.filter(d =>
        DateHelper.toDate(d.donationDate).getFullYear() === year);

      const html = generateStatementHtml({ year, person: currentUserChurch?.person as any, church: currentUserChurch?.church, funds, fundDonations, donations });

      await Print.printAsync({ html });
    } catch (err) {
      Alert.alert(t("common.error"), t("donations.statementFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={[styles.card, { shadowColor: colors.shadowBlack }]}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialIcons name="receipt-long" size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>{t("donations.printStatement")}</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.disabled }]}>{t("donations.annualGivingStatement")}</Text>

        <SegmentedButtons
          value={yearOffset}
          onValueChange={setYearOffset}
          style={styles.segmented}
          buttons={[
            { value: "0", label: `${currentYear}` },
            { value: "1", label: `${currentYear - 1}` }
          ]}
        />

        <Button
          mode="contained"
          icon={loading ? undefined : "printer"}
          style={[styles.button, { backgroundColor: colors.primary }]}
          labelStyle={styles.buttonLabel}
          onPress={handlePrint}
          disabled={loading}
        >
          {loading ? t("donations.generatingStatement") : t("donations.printStatement")}
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4
  },
  title: {
    fontSize: 16,
    fontWeight: "700"
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 12
  },
  segmented: { marginBottom: 12 },
  button: { borderRadius: 8 },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "600"
  }
});

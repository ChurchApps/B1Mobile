import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CurrencyHelper } from "../../../helpers/CurrencyHelper";
import { useTranslation } from "react-i18next";

interface GivingStats {
  ytd: number;
  lastGift: number;
  totalGifts: number;
  lastGiftDate: Date | null;
}

interface GivingOverviewProps {
  givingStats: GivingStats;
  onDonatePress: () => void;
  onHistoryPress: () => void;
}

export const GivingOverview: React.FC<GivingOverviewProps> = ({ givingStats, onDonatePress, onHistoryPress }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Hero Stats Card */}
      <Card style={styles.heroCard}>
        <LinearGradient colors={["#0D47A1", "#2196F3"]} style={styles.heroGradient}>
          <View style={styles.heroContent}>
            <Text variant="headlineSmall" style={styles.heroTitle}>
              {t("donations.yourGivingImpact")}
            </Text>
            <Text variant="displaySmall" style={styles.heroAmount}>
              {CurrencyHelper.formatCurrency(givingStats.ytd)}
            </Text>
            <Text variant="bodyMedium" style={styles.heroSubtitle}>
              {t("donations.totalThisYear")} • {givingStats.totalGifts} {t("donations.gifts")}
            </Text>
          </View>
        </LinearGradient>
      </Card>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {t("donations.recentActivity")}
          </Text>
          <Button mode="text" onPress={onHistoryPress} labelStyle={{ color: "#0D47A1" }}>
            {t("common.viewAll")}
          </Button>
        </View>

        <Card style={styles.activityCard}>
          <Card.Content style={styles.activityContent}>
            <View style={styles.activityIcon}>
              <MaterialIcons name="favorite" size={24} color="#70DC87" />
            </View>
            <View style={styles.activityDetails}>
              <Text variant="titleMedium" style={styles.activityTitle}>
                {t("donations.lastGift")}
              </Text>
              <Text variant="bodyMedium" style={styles.activityAmount}>
                {CurrencyHelper.formatCurrency(givingStats.lastGift)}
              </Text>
              <Text variant="bodySmall" style={styles.activityDate}>
                {givingStats.lastGiftDate ? givingStats.lastGiftDate.toLocaleDateString() : t("donations.noRecentGift")}
              </Text>
            </View>
            <TouchableOpacity style={styles.repeatButton} onPress={onDonatePress}>
              <Text variant="labelMedium" style={styles.repeatButtonText}>
                {t("donations.repeat")}
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>

      {/* CTA Section */}
      <Card style={styles.ctaCard}>
        <Card.Content style={styles.ctaContent}>
          <MaterialIcons name="volunteer-activism" size={48} color="#0D47A1" style={styles.ctaIcon} />
          <Text variant="titleLarge" style={styles.ctaTitle}>
            {t("donations.makeDifferenceToday")}
          </Text>
          <Text variant="bodyMedium" style={styles.ctaSubtitle}>
            {t("donations.generosityHelps")}
          </Text>
          <Button mode="contained" onPress={onDonatePress} style={styles.ctaButton} labelStyle={styles.ctaButtonText}>
            {t("donations.giveNow")}
          </Button>
        </Card.Content>
      </Card>
    </>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  heroGradient: {
    padding: 24,
    minHeight: 160
  },
  heroContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  heroTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center"
  },
  heroAmount: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginBottom: 8
  },
  heroSubtitle: {
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center"
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  sectionTitle: {
    color: "#3c3c3c",
    fontWeight: "700",
    fontSize: 20
  },
  activityCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  activityContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F6F6F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  activityDetails: {
    flex: 1
  },
  activityTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 2
  },
  activityAmount: {
    color: "#0D47A1",
    fontWeight: "700",
    marginBottom: 2
  },
  activityDate: {
    color: "#9E9E9E"
  },
  repeatButton: {
    backgroundColor: "rgba(21, 101, 192, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  repeatButtonText: {
    color: "#0D47A1",
    fontWeight: "600"
  },
  ctaCard: {
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(21, 101, 192, 0.1)"
  },
  ctaContent: {
    alignItems: "center",
    padding: 24
  },
  ctaIcon: {
    marginBottom: 16
  },
  ctaTitle: {
    color: "#3c3c3c",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  ctaSubtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16
  },
  ctaButton: {
    backgroundColor: "#0D47A1",
    borderRadius: 12,
    paddingHorizontal: 32,
    elevation: 3,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16
  }
});
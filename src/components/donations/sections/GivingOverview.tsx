import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CurrencyHelper, DateHelper } from "../../../helpers";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../../theme";

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
  const colors = useThemeColors();

  return (
    <>
      {/* Hero Stats Card */}
      <Card style={[styles.heroCard, { shadowColor: colors.primary }]}>
        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.heroGradient}>
          <View style={styles.heroContent}>
            <Text variant="headlineSmall" style={[styles.heroTitle, { color: colors.white }]}>
              {t("donations.yourGivingImpact")}
            </Text>
            <Text variant="displaySmall" style={[styles.heroAmount, { color: colors.white }]}>
              {CurrencyHelper.formatCurrency(givingStats.ytd)}
            </Text>
            <Text variant="bodyMedium" style={[styles.heroSubtitle, { color: colors.white }]}>
              {t("donations.totalThisYear")} • {givingStats.totalGifts} {t("donations.gifts")}
            </Text>
          </View>
        </LinearGradient>
      </Card>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: colors.text }]}>
            {t("donations.recentActivity")}
          </Text>
          <Button mode="text" onPress={onHistoryPress} labelStyle={{ color: colors.primary }}>
            {t("common.viewAll")}
          </Button>
        </View>

        <Card style={[styles.activityCard, { shadowColor: colors.shadowBlack }]}>
          <Card.Content style={styles.activityContent}>
            <View style={[styles.activityIcon, { backgroundColor: colors.iconBackground }]}>
              <MaterialIcons name="favorite" size={24} color={colors.success} />
            </View>
            <View style={styles.activityDetails}>
              <Text variant="titleMedium" style={[styles.activityTitle, { color: colors.text }]}>
                {t("donations.lastGift")}
              </Text>
              <Text variant="bodyMedium" style={[styles.activityAmount, { color: colors.primary }]}>
                {CurrencyHelper.formatCurrency(givingStats.lastGift)}
              </Text>
              <Text variant="bodySmall" style={[styles.activityDate, { color: colors.disabled }]}>
                {givingStats.lastGiftDate ? DateHelper.prettyDate(givingStats.lastGiftDate) : t("donations.noRecentGift")}
              </Text>
            </View>
            <TouchableOpacity style={styles.repeatButton} onPress={onDonatePress}>
              <Text variant="labelMedium" style={[styles.repeatButtonText, { color: colors.primary }]}>
                {t("donations.repeat")}
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>

      {/* CTA Section */}
      <Card style={[styles.ctaCard, { shadowColor: colors.shadowBlack }]}>
        <Card.Content style={styles.ctaContent}>
          <MaterialIcons name="volunteer-activism" size={48} color={colors.primary} style={styles.ctaIcon} />
          <Text variant="titleLarge" style={[styles.ctaTitle, { color: colors.text }]}>
            {t("donations.makeDifferenceToday")}
          </Text>
          <Text variant="bodyMedium" style={[styles.ctaSubtitle, { color: colors.disabled }]}>
            {t("donations.generosityHelps")}
          </Text>
          <Button mode="contained" onPress={onDonatePress} style={[styles.ctaButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} labelStyle={[styles.ctaButtonText, { color: colors.white }]}>
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
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center"
  },
  heroAmount: {
    fontWeight: "800",
    marginBottom: 8
  },
  heroSubtitle: {
    opacity: 0.9,
    textAlign: "center"
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 20
  },
  activityCard: {
    borderRadius: 16,
    elevation: 2,
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  activityDetails: { flex: 1 },
  activityTitle: {
    fontWeight: "600",
    marginBottom: 2
  },
  activityAmount: {
    fontWeight: "700",
    marginBottom: 2
  },
  activityDate: {},
  repeatButton: {
    backgroundColor: "rgba(21, 101, 192, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  repeatButtonText: {
    fontWeight: "600"
  },
  ctaCard: {
    borderRadius: 20,
    elevation: 3,
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
  ctaIcon: { marginBottom: 16 },
  ctaTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  ctaSubtitle: {
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16
  },
  ctaButton: {
    borderRadius: 12,
    paddingHorizontal: 32,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  ctaButtonText: {
    fontWeight: "700",
    fontSize: 16
  }
});

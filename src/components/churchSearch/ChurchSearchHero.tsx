import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { useTranslation } from "react-i18next";

export const ChurchSearchHero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.heroSection}>
      <Card style={styles.heroCard}>
        <LinearGradient
          colors={["#0D47A1", "#2196F3"]}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <MaterialIcons
              name="church"
              size={DimensionHelper.wp(12)}
              color="#FFFFFF"
              style={styles.heroIcon}
            />
            <Text style={styles.heroTitle}>{t("churchSearch.findYourChurch")}</Text>
            <Text style={styles.heroSubtitle}>
              {t("churchSearch.connectWithCommunity")}
            </Text>
          </View>
        </LinearGradient>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    paddingHorizontal: DimensionHelper.wp(4),
    paddingVertical: DimensionHelper.hp(2),
  },
  heroCard: {
    borderRadius: DimensionHelper.wp(5),
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  heroGradient: {
    paddingVertical: DimensionHelper.hp(4),
    paddingHorizontal: DimensionHelper.wp(6),
    minHeight: DimensionHelper.hp(20),
  },
  heroContent: {
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  heroIcon: {
    marginBottom: DimensionHelper.hp(2),
  },
  heroTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: DimensionHelper.wp(5.2),
    marginBottom: DimensionHelper.hp(1),
    textAlign: "center",
  },
  heroSubtitle: {
    color: "#FFFFFF",
    opacity: 0.9,
    fontSize: DimensionHelper.wp(4),
    textAlign: "center",
  },
});

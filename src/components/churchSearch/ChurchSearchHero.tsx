import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

export const ChurchSearchHero: React.FC = () => {
  return (
    <View style={styles.heroSection}>
      <Card style={styles.heroCard}>
        <LinearGradient colors={["#0D47A1", "#2196F3"]} style={styles.heroGradient}>
          <View style={styles.heroContent}>
            <MaterialIcons name="church" size={48} color="#FFFFFF" style={styles.heroIcon} />
            <Text variant="headlineMedium" style={styles.heroTitle}>
              Find Your Church
            </Text>
            <Text variant="bodyLarge" style={styles.heroSubtitle}>
              Connect with your church community today
            </Text>
          </View>
        </LinearGradient>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16
  },
  heroCard: {
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
    minHeight: 140
  },
  heroContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  heroIcon: {
    marginBottom: 12
  },
  heroTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center"
  },
  heroSubtitle: {
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center"
  }
});
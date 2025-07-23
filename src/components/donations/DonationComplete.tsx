import { UserHelper } from "../../helpers";
import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useAppTheme } from "../../theme";
import { Text } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  onDone: () => void;
  amount: string;
  isRecurring?: boolean;
  interval?: string;
}

export const DonationComplete = (props: Props) => {
  const { theme, spacing } = useAppTheme();
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    UserHelper.addOpenScreenEvent("DonationCompleteScreen");
    setTimeout(() => {
      props.onDone();
    }, 3000);
  }, []);

  const getRecurringText = () => {
    if (!props.isRecurring) return "";
    switch (props.interval) {
      case "one_week": return "weekly";
      case "one_month": return "monthly";
      case "three_month": return "quarterly";
      case "one_year": return "annually";
      default: return "monthly";
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0D47A1", "#2196F3"]} style={styles.background}>
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.successIconBackground}>
              <MaterialIcons name="favorite" size={80} color="#FF4081" />
            </View>
          </View>

          {/* Success Message */}
          <View style={styles.messageContainer}>
            <Text variant="headlineLarge" style={styles.successTitle}>
              Thank You!
            </Text>
            <Text variant="titleLarge" style={styles.successAmount}>
              {props.amount} {props.isRecurring ? getRecurringText() : ""}
            </Text>
            <Text variant="bodyLarge" style={styles.successSubtitle}>
              Your {props.isRecurring ? "recurring " : ""}donation has been processed successfully.
            </Text>
            <Text variant="bodyMedium" style={styles.successDetails}>
              Your generosity helps us continue our mission and serve our community.
            </Text>
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorativeContainer}>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.decorativeCircle3} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    width: "100%",
    maxWidth: 400
  },
  iconContainer: {
    marginBottom: 32
  },
  successIconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 32
  },
  successTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  successAmount: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  successSubtitle: {
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  successDetails: {
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  decorativeContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1
  },
  decorativeCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: "10%",
    right: "-10%"
  },
  decorativeCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: "20%",
    left: "-10%"
  },
  decorativeCircle3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    top: "30%",
    left: "20%"
  }
});
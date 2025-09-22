import { UserHelper } from "@/helpers/UserHelper";
import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useAppTheme } from "../../../src/theme";
import { Text } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  onDone: () => void;
  handleBack: () => void;
}

export const CheckinComplete = (props: Props) => {
  const { theme, spacing } = useAppTheme();
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    UserHelper.addOpenScreenEvent("CheckinCompleteScreen");
    setTimeout(() => {
      props.onDone();
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0D47A1", "#2196F3"]} style={styles.background}>
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.successIconBackground}>
              <MaterialIcons name="check-circle" size={80} color="#70DC87" />
            </View>
          </View>

          {/* Success Message */}
          <View style={styles.messageContainer}>
            <Text variant="headlineLarge" style={styles.successTitle}>
              Check-in Complete!
            </Text>
            <Text variant="bodyLarge" style={styles.successSubtitle}>
              You have been successfully checked in.
            </Text>
            <Text variant="bodyMedium" style={styles.successDetails}>
              Thank you for being part of our church community.
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

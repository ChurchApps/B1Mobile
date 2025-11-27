import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

export interface LiveStreamData {
  isLive: boolean;
  nextStreamDate: Date;
  streamTitle: string;
  streamDescription: string;
  streamUrl: string;
}

interface LiveStreamCardProps {
  liveStreamData: LiveStreamData;
  timeUntilStream: {
    expired: boolean;
    days: number;
    hours: number;
    minutes: number;
  };
  onWatchLive?: () => void;
}

export const LiveStreamCard: React.FC<LiveStreamCardProps> = ({ liveStreamData, timeUntilStream, onWatchLive }) => {
  const { t } = useTranslation();

  if (liveStreamData.isLive) {
    return (
      <Card style={styles.liveCard}>
        <LinearGradient colors={["#D32F2F", "#F44336"]} style={styles.liveGradient}>
          <View style={styles.liveContent}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text variant="titleMedium" style={styles.liveText}>
                {t("sermons.liveNow")}
              </Text>
            </View>
            <Text variant="headlineSmall" style={styles.liveTitle}>
              {liveStreamData.streamTitle}
            </Text>
            <Text variant="bodyMedium" style={styles.liveDescription}>
              {liveStreamData.streamDescription}
            </Text>
            <Button
              mode="contained"
              style={styles.watchButton}
              labelStyle={styles.watchButtonText}
              icon="play-circle"
              onPress={onWatchLive || (() => {})}>
              {t("sermons.watchLive")}
            </Button>
          </View>
        </LinearGradient>
      </Card>
    );
  }

  return (
    <Card style={styles.countdownCard}>
      <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.countdownGradient}>
        <View style={styles.countdownContent}>
          <Text variant="titleMedium" style={styles.countdownLabel}>
            {t("sermons.nextServiceIn")}
          </Text>
          <View style={styles.countdownTimer}>
            {timeUntilStream.days > 0 && (
              <View style={styles.timeUnit}>
                <Text variant="displaySmall" style={styles.timeNumber}>
                  {timeUntilStream.days}
                </Text>
                <Text variant="bodyMedium" style={styles.timeLabel}>
                  {timeUntilStream.days === 1 ? t("sermons.day") : t("sermons.days")}
                </Text>
              </View>
            )}
            <View style={styles.timeUnit}>
              <Text variant="displaySmall" style={styles.timeNumber}>
                {timeUntilStream.hours}
              </Text>
              <Text variant="bodyMedium" style={styles.timeLabel}>
                {timeUntilStream.hours === 1 ? t("sermons.hour") : t("sermons.hours")}
              </Text>
            </View>
            <View style={styles.timeUnit}>
              <Text variant="displaySmall" style={styles.timeNumber}>
                {timeUntilStream.minutes}
              </Text>
              <Text variant="bodyMedium" style={styles.timeLabel}>
                {timeUntilStream.minutes === 1 ? t("sermons.minute") : t("sermons.minutes")}
              </Text>
            </View>
          </View>
          <Text variant="titleMedium" style={styles.streamTitle}>
            {liveStreamData.streamTitle}
          </Text>
          <Text variant="bodyMedium" style={styles.streamDescription}>
            {liveStreamData.streamDescription}
          </Text>
          <Text variant="bodySmall" style={styles.streamTime}>
            {liveStreamData.nextStreamDate.toLocaleDateString()} at {liveStreamData.nextStreamDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  liveCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  liveGradient: {
    padding: 24,
    alignItems: "center"
  },
  liveContent: {
    alignItems: "center"
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    marginRight: 8
  },
  liveText: {
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: 1
  },
  liveTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  liveDescription: {
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 20
  },
  watchButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 24
  },
  watchButtonText: {
    color: "#D32F2F",
    fontWeight: "700"
  },
  countdownCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  countdownGradient: {
    padding: 24,
    alignItems: "center"
  },
  countdownContent: {
    alignItems: "center"
  },
  countdownLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  countdownTimer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 24
  },
  timeUnit: {
    alignItems: "center"
  },
  timeNumber: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 36,
    marginBottom: 4
  },
  timeLabel: {
    color: "#FFFFFF",
    opacity: 0.8,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase"
  },
  streamTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  streamDescription: {
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 12
  },
  streamTime: {
    color: "#FFFFFF",
    opacity: 0.8,
    textAlign: "center",
    fontSize: 14
  }
});
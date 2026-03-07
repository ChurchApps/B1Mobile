import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { DateHelper } from "../../helpers";
import { useThemeColors } from "../../theme";

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
  const colors = useThemeColors();

  if (liveStreamData.isLive) {
    return (
      <Card style={[styles.liveCard, { shadowColor: colors.error }]}>
        <LinearGradient colors={["#D32F2F", "#F44336"]} style={styles.liveGradient}>
          <View style={styles.liveContent}>
            <View style={styles.liveIndicator}>
              <View style={[styles.liveDot, { backgroundColor: colors.white }]} />
              <Text variant="titleMedium" style={[styles.liveText, { color: colors.white }]}>
                {t("sermons.liveNow")}
              </Text>
            </View>
            <Text variant="headlineSmall" style={[styles.liveTitle, { color: colors.white }]}>
              {liveStreamData.streamTitle}
            </Text>
            <Text variant="bodyMedium" style={[styles.liveDescription, { color: colors.white }]}>
              {liveStreamData.streamDescription}
            </Text>
            <Button
              mode="contained"
              style={[styles.watchButton, { backgroundColor: colors.white }]}
              labelStyle={[styles.watchButtonText, { color: colors.error }]}
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
    <Card style={[styles.countdownCard, { shadowColor: colors.primary }]}>
      <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.countdownGradient}>
        <View style={styles.countdownContent}>
          <Text variant="titleMedium" style={[styles.countdownLabel, { color: colors.white }]}>
            {t("sermons.nextServiceIn")}
          </Text>
          <View style={styles.countdownTimer}>
            {timeUntilStream.days > 0 && (
              <View style={styles.timeUnit}>
                <Text variant="displaySmall" style={[styles.timeNumber, { color: colors.white }]}>
                  {timeUntilStream.days}
                </Text>
                <Text variant="bodyMedium" style={[styles.timeLabel, { color: colors.white }]}>
                  {timeUntilStream.days === 1 ? t("sermons.day") : t("sermons.days")}
                </Text>
              </View>
            )}
            <View style={styles.timeUnit}>
              <Text variant="displaySmall" style={[styles.timeNumber, { color: colors.white }]}>
                {timeUntilStream.hours}
              </Text>
              <Text variant="bodyMedium" style={[styles.timeLabel, { color: colors.white }]}>
                {timeUntilStream.hours === 1 ? t("sermons.hour") : t("sermons.hours")}
              </Text>
            </View>
            <View style={styles.timeUnit}>
              <Text variant="displaySmall" style={[styles.timeNumber, { color: colors.white }]}>
                {timeUntilStream.minutes}
              </Text>
              <Text variant="bodyMedium" style={[styles.timeLabel, { color: colors.white }]}>
                {timeUntilStream.minutes === 1 ? t("sermons.minute") : t("sermons.minutes")}
              </Text>
            </View>
          </View>
          <Text variant="titleMedium" style={[styles.streamTitle, { color: colors.white }]}>
            {liveStreamData.streamTitle}
          </Text>
          <Text variant="bodyMedium" style={[styles.streamDescription, { color: colors.white }]}>
            {liveStreamData.streamDescription}
          </Text>
          <Text variant="bodySmall" style={[styles.streamTime, { color: colors.white }]}>
            {DateHelper.prettyDate(liveStreamData.nextStreamDate)} at {DateHelper.prettyTime(liveStreamData.nextStreamDate)}
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  liveGradient: {
    padding: 24,
    alignItems: "center"
  },
  liveContent: { alignItems: "center" },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  liveText: {
    fontWeight: "800",
    letterSpacing: 1
  },
  liveTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  liveDescription: {
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 20
  },
  watchButton: {
    borderRadius: 25,
    paddingHorizontal: 24
  },
  watchButtonText: { fontWeight: "700" },
  countdownCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  countdownGradient: {
    padding: 24,
    alignItems: "center"
  },
  countdownContent: { alignItems: "center" },
  countdownLabel: {
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
  timeUnit: { alignItems: "center" },
  timeNumber: {
    fontWeight: "800",
    fontSize: 36,
    marginBottom: 4
  },
  timeLabel: {
    opacity: 0.8,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase"
  },
  streamTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  streamDescription: {
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 12
  },
  streamTime: {
    opacity: 0.8,
    textAlign: "center",
    fontSize: 14
  }
});

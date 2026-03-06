import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Button, Chip } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { DateHelper } from "@churchapps/helpers";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SignupPlanData } from "@/interfaces";

interface Props {
  signupPlans: SignupPlanData[];
}

const getTotalSlots = (positions: SignupPlanData["positions"]) => {
  const total = positions.reduce((sum, p) => sum + (p.count || 0), 0);
  const filled = positions.reduce((sum, p) => sum + p.filledCount, 0);
  return { total, filled, remaining: total - filled };
};

export function VolunteerBrowseList({ signupPlans }: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  if (signupPlans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="volunteer-activism" size={48} color="#9E9E9E" />
        <Text style={styles.emptyTitle}>{t("volunteer.browseOpportunities")}</Text>
        <Text style={styles.emptyText}>{t("volunteer.noOpportunities")}</Text>
      </View>
    );
  }

  return (
    <View>
      {signupPlans.map(({ plan, positions, times }) => {
        const { total, filled, remaining } = getTotalSlots(positions);
        const progress = total > 0 ? (filled / total) * 100 : 0;

        return (
          <Card key={plan.id} style={styles.card}>
            <Card.Content>
              <View style={styles.headerRow}>
                <View style={styles.headerText}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDate}>
                    {DateHelper.prettyDate(new Date(plan.serviceDate!))}
                    {times.length > 0 && (" \u00b7 " + times.map(t => t.displayName).join(", "))}
                  </Text>
                </View>
                <Chip
                  style={[styles.statusChip, remaining > 0 ? styles.openChip : styles.fullChip]}
                  textStyle={[styles.chipText, remaining > 0 ? styles.openChipText : styles.fullChipText]}
                  compact
                >
                  {remaining > 0 ? t("volunteer.spotsOpen", { count: remaining }) : t("volunteer.full")}
                </Chip>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {t("volunteer.positionsFilledOf", { filled, total })}
                </Text>
              </View>

              <View style={styles.positionChips}>
                {positions.map(p => {
                  const open = (p.count || 0) - p.filledCount;
                  return (
                    <Chip
                      key={p.id}
                      style={[styles.positionChip, open > 0 ? styles.positionOpen : styles.positionFull]}
                      textStyle={styles.positionChipText}
                      compact
                    >
                      {p.name} ({t("volunteer.openSlots", { count: open })})
                    </Chip>
                  );
                })}
              </View>

              {remaining > 0 && (
                <View style={styles.buttonRow}>
                  <Button
                    mode="contained"
                    compact
                    style={styles.signupButton}
                    labelStyle={styles.signupButtonLabel}
                    onPress={() => router.push(`/volunteerSignup/${plan.id}`)}
                  >
                    {t("volunteer.viewAndSignUp")}
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3c3c3c",
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center"
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  headerText: {
    flex: 1,
    marginRight: 8
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3c3c3c",
    marginBottom: 4
  },
  planDate: {
    fontSize: 14,
    color: "#666"
  },
  statusChip: {
    borderRadius: 12,
    height: 28
  },
  openChip: {
    backgroundColor: "#E8F5E9"
  },
  fullChip: {
    backgroundColor: "#F5F5F5"
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600"
  },
  openChipText: {
    color: "#388E3C"
  },
  fullChipText: {
    color: "#9E9E9E"
  },
  progressContainer: {
    marginTop: 16,
    marginBottom: 8
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    overflow: "hidden"
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0D47A1"
  },
  progressText: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 4
  },
  positionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8
  },
  positionChip: {
    borderRadius: 12,
    height: 28
  },
  positionOpen: {
    backgroundColor: "#E3F2FD"
  },
  positionFull: {
    backgroundColor: "#F5F5F5"
  },
  positionChipText: {
    fontSize: 11,
    color: "#3c3c3c"
  },
  buttonRow: {
    alignItems: "flex-end",
    marginTop: 16
  },
  signupButton: {
    borderRadius: 8,
    backgroundColor: "#0D47A1"
  },
  signupButtonLabel: {
    fontSize: 14,
    fontWeight: "600"
  }
});

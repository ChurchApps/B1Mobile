import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Card, Button, Chip } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ApiHelper, DateHelper, AssignmentInterface } from "@churchapps/helpers";
import { useTranslation } from "react-i18next";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import { SignupPlanData, PositionWithCount } from "@/interfaces";

interface Props {
  planId: string;
}

export function VolunteerSignupDetail({ planId }: Props) {
  const { t } = useTranslation();
  const currentUserChurch = useCurrentUserChurch();
  const isLoggedIn = !!currentUserChurch?.jwt;
  const churchId = currentUserChurch?.church?.id;

  const [planData, setPlanData] = useState<SignupPlanData | null>(null);
  const [myAssignments, setMyAssignments] = useState<AssignmentInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = useCallback(async () => {
    if (!churchId) return;
    try {
      const allPlans: SignupPlanData[] = await ApiHelper.getAnonymous("/plans/public/signup/" + churchId, "DoingApi");
      const found = (allPlans || []).find((sp: SignupPlanData) => sp.plan.id === planId);
      if (found) setPlanData(found);

      if (isLoggedIn) {
        const assignments: AssignmentInterface[] = await ApiHelper.get("/assignments/my", "DoingApi");
        if (found) {
          const positionIds = found.positions.map(p => p.id);
          setMyAssignments(assignments.filter(a => positionIds.includes(a.positionId)));
        }
      }
    } finally {
      setLoading(false);
    }
  }, [churchId, planId, isLoggedIn]);

  useEffect(() => { loadData(); }, [loadData]);

  const isDeadlinePassed = () => {
    if (!planData?.plan.signupDeadlineHours || !planData?.plan.serviceDate) return false;
    const deadline = new Date(planData.plan.serviceDate);
    deadline.setHours(deadline.getHours() - planData.plan.signupDeadlineHours);
    return new Date() > deadline;
  };

  const getMyAssignment = (positionId: string) => myAssignments.find(a => a.positionId === positionId);

  const handleSignup = async (positionId: string) => {
    if (!isLoggedIn) return;
    setActionLoading(positionId);
    setMessage(null);
    try {
      await ApiHelper.post("/assignments/signup", { positionId }, "DoingApi");
      setMessage({ type: "success", text: t("volunteer.signUpSuccess") });
      await loadData();
    } catch (err: any) {
      const errMsg = err?.message || err?.toString() || "";
      if (errMsg.includes("full")) setMessage({ type: "error", text: t("volunteer.positionFull") });
      else if (errMsg.includes("deadline")) setMessage({ type: "error", text: t("volunteer.deadlinePassed") });
      else if (errMsg.includes("Already")) setMessage({ type: "error", text: t("volunteer.alreadySignedUp") });
      else setMessage({ type: "error", text: t("volunteer.signupFailed") });
    }
    setActionLoading(null);
  };

  const handleRemove = async (assignmentId: string) => {
    setActionLoading(assignmentId);
    setMessage(null);
    try {
      await ApiHelper.delete("/assignments/signup/" + assignmentId, "DoingApi");
      setMessage({ type: "success", text: t("volunteer.removeSuccess") });
      await loadData();
    } catch (err: any) {
      const errMsg = err?.message || err?.toString() || "";
      if (errMsg.includes("deadline")) setMessage({ type: "error", text: t("volunteer.deadlinePassed") });
      else setMessage({ type: "error", text: t("volunteer.removalFailed") });
    }
    setActionLoading(null);
  };

  const confirmRemove = (assignmentId: string) => {
    Alert.alert(
      t("volunteer.confirmRemoveTitle"),
      t("volunteer.confirmRemoveMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("volunteer.remove"), style: "destructive", onPress: () => handleRemove(assignmentId) }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D47A1" />
        <Text style={styles.loadingText}>{t("volunteer.loadingOpportunities")}</Text>
      </View>
    );
  }

  if (!planData) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="error-outline" size={48} color="#9E9E9E" />
        <Text style={styles.emptyText}>{t("plans.planNotFound")}</Text>
      </View>
    );
  }

  const { plan, positions, times } = planData;
  const deadlinePassed = isDeadlinePassed();

  // Group positions by category
  const categories: Record<string, PositionWithCount[]> = {};
  positions.forEach(p => {
    const cat = p.categoryName || t("volunteer.general");
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(p);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.planDate}>
        {DateHelper.prettyDate(new Date(plan.serviceDate!))}
        {times.length > 0 && (" \u00b7 " + times.map(t => t.displayName).join(", "))}
      </Text>
      {plan.notes ? <Text style={styles.planNotes}>{plan.notes}</Text> : null}

      {/* Deadline warning */}
      {deadlinePassed && (
        <Card style={styles.warningCard}>
          <Card.Content style={styles.warningContent}>
            <MaterialIcons name="schedule" size={20} color="#E65100" />
            <Text style={styles.warningText}>{t("volunteer.deadlinePassed")}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Login prompt */}
      {!isLoggedIn && (
        <Card style={styles.infoCard}>
          <Card.Content style={styles.infoContent}>
            <MaterialIcons name="info-outline" size={20} color="#0D47A1" />
            <Text style={styles.infoText}>{t("volunteer.loginToSignUp")}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Status message */}
      {message && (
        <Card style={[styles.messageCard, message.type === "success" ? styles.successCard : styles.errorCard]}>
          <Card.Content style={styles.messageContent}>
            <MaterialIcons
              name={message.type === "success" ? "check-circle" : "error"}
              size={20}
              color={message.type === "success" ? "#388E3C" : "#B0120C"}
            />
            <Text style={[styles.messageText, message.type === "success" ? styles.successText : styles.errorText]}>
              {message.text}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Position categories */}
      {Object.entries(categories).map(([category, catPositions]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          {catPositions.map(position => {
            const remaining = (position.count || 0) - position.filledCount;
            const isFull = remaining <= 0;
            const progress = (position.count || 0) > 0 ? (position.filledCount / (position.count || 1)) * 100 : 0;
            const myAssignment = getMyAssignment(position.id!);
            const isSignedUp = !!myAssignment;

            return (
              <Card
                key={position.id}
                style={[styles.positionCard, isSignedUp && styles.positionCardSignedUp]}
              >
                <Card.Content>
                  <View style={styles.positionHeader}>
                    <View style={styles.positionInfo}>
                      <View style={styles.positionNameRow}>
                        <Text style={styles.positionName}>{position.name}</Text>
                        {isSignedUp && (
                          <Chip style={styles.signedUpChip} textStyle={styles.signedUpChipText} compact>
                            {t("volunteer.signedUp")}
                          </Chip>
                        )}
                      </View>
                      {position.description ? (
                        <Text style={styles.positionDescription}>{position.description}</Text>
                      ) : null}
                    </View>
                    <View>
                      {isSignedUp ? (
                        <Button
                          mode="outlined"
                          compact
                          textColor="#B0120C"
                          style={styles.removeButton}
                          labelStyle={styles.actionButtonLabel}
                          disabled={deadlinePassed || actionLoading === myAssignment.id}
                          onPress={() => confirmRemove(myAssignment.id!)}
                        >
                          {actionLoading === myAssignment.id ? t("volunteer.removing") : t("volunteer.remove")}
                        </Button>
                      ) : (
                        <Button
                          mode="contained"
                          compact
                          style={styles.signupButton}
                          labelStyle={styles.actionButtonLabel}
                          disabled={isFull || deadlinePassed || !isLoggedIn || actionLoading === position.id}
                          onPress={() => handleSignup(position.id!)}
                        >
                          {actionLoading === position.id
                            ? t("volunteer.signingUp")
                            : isFull
                              ? t("volunteer.full")
                              : t("volunteer.signUp")}
                        </Button>
                      )}
                    </View>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${Math.min(progress, 100)}%` },
                          isFull && styles.progressBarFull
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {remaining > 0
                        ? t("volunteer.slotsRemaining", { count: remaining, total: position.count })
                        : t("volunteer.allSlotsFilled", { total: position.count })}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 60 },
  loadingText: { marginTop: 12, fontSize: 14, color: "#9E9E9E" },
  emptyContainer: { alignItems: "center", justifyContent: "center", padding: 60 },
  emptyText: { marginTop: 12, fontSize: 16, color: "#9E9E9E" },

  // Header
  planName: { fontSize: 24, fontWeight: "700", color: "#3c3c3c", marginBottom: 4 },
  planDate: { fontSize: 15, color: "#666", marginBottom: 8 },
  planNotes: { fontSize: 14, color: "#666", marginBottom: 16 },

  // Alert cards
  warningCard: { backgroundColor: "#FFF3E0", marginBottom: 12, borderRadius: 12 },
  warningContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  warningText: { flex: 1, fontSize: 14, color: "#E65100" },
  infoCard: { backgroundColor: "#E3F2FD", marginBottom: 12, borderRadius: 12 },
  infoContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { flex: 1, fontSize: 14, color: "#0D47A1" },
  messageCard: { marginBottom: 12, borderRadius: 12 },
  messageContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  messageText: { flex: 1, fontSize: 14 },
  successCard: { backgroundColor: "#E8F5E9" },
  errorCard: { backgroundColor: "#FFEBEE" },
  successText: { color: "#388E3C" },
  errorText: { color: "#B0120C" },

  // Categories
  categorySection: { marginBottom: 24 },
  categoryTitle: { fontSize: 18, fontWeight: "700", color: "#3c3c3c", marginBottom: 12 },

  // Position cards
  positionCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  positionCardSignedUp: { borderWidth: 1, borderColor: "#388E3C" },
  positionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  positionInfo: { flex: 1, marginRight: 12 },
  positionNameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  positionName: { fontSize: 16, fontWeight: "600", color: "#3c3c3c" },
  positionDescription: { fontSize: 13, color: "#666", marginTop: 4 },
  signedUpChip: { backgroundColor: "#E8F5E9", borderRadius: 12, height: 24 },
  signedUpChipText: { fontSize: 11, color: "#388E3C", fontWeight: "600" },

  // Buttons
  removeButton: { borderRadius: 8, borderColor: "#B0120C" },
  signupButton: { borderRadius: 8, backgroundColor: "#0D47A1" },
  actionButtonLabel: { fontSize: 13, fontWeight: "600" },

  // Progress
  progressContainer: { marginTop: 12 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: "#E0E0E0", overflow: "hidden" },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: "#0D47A1" },
  progressBarFull: { backgroundColor: "#B0120C" },
  progressText: { fontSize: 12, color: "#9E9E9E", marginTop: 4 }
});

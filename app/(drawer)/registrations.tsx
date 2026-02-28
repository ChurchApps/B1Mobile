import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, View, Alert } from "react-native";
import { Button, Card, Chip, Divider, Provider as PaperProvider, Text, MD3LightTheme } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { useNavigation as useReactNavigation, DrawerActions, useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "../../src/hooks";
import { useCurrentUserChurch } from "../../src/stores/useUserStore";
import { ApiHelper } from "@churchapps/helpers";
import dayjs from "../../src/helpers/dayjsConfig";
import { RegistrationInterface } from "@churchapps/helpers";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#0D47A1",
    secondary: "#F6F6F8",
    surface: "#FFFFFF",
    background: "#F6F6F8",
    elevation: {
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#F6F6F8",
      level3: "#F0F0F0",
      level4: "#E9ECEF",
      level5: "#E2E6EA"
    }
  }
};

const Registrations = () => {
  const navigation = useReactNavigation();
  const { navigateBack } = useNavigation();
  const currentUserChurch = useCurrentUserChurch();
  const [registrations, setRegistrations] = useState<RegistrationInterface[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const personId = currentUserChurch?.person?.id;
    if (!personId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await ApiHelper.get("/registrations/person/" + personId, "ContentApi");
      setRegistrations(data || []);
    } catch {
      setRegistrations([]);
    }
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadData(); }, [currentUserChurch?.person?.id]));

  const handleCancel = (regId: string) => {
    Alert.alert("Cancel Registration", "Are you sure you want to cancel this registration?", [
      { text: "Keep", style: "cancel" },
      {
        text: "Cancel Registration", style: "destructive", onPress: async () => {
          await ApiHelper.post("/registrations/" + regId + "/cancel", {}, "ContentApi");
          loadData();
        }
      }
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "#4CAF50";
      case "pending": return "#FF9800";
      case "cancelled": return "#F44336";
      default: return "#9E9E9E";
    }
  };

  const renderItem = ({ item }: { item: RegistrationInterface }) => {
    const isCancelled = item.status === "cancelled";
    return (
      <Card style={[styles.card, isCancelled && styles.cancelledCard]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.eventTitle}>{item.event?.title || "Event"}</Text>
            <Chip compact style={{ backgroundColor: getStatusColor(item.status) + "22" }} textStyle={{ color: getStatusColor(item.status), fontSize: 12 }}>
              {item.status}
            </Chip>
          </View>

          {item.event?.start && (
            <View style={styles.timeRow}>
              <MaterialIcons name="access-time" size={14} color="#666" />
              <Text variant="bodySmall" style={styles.timeText}>{dayjs(item.event.start).format("LLL")}</Text>
            </View>
          )}

          {item.members && item.members.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <Text variant="bodySmall" style={styles.membersLabel}>Registered Members:</Text>
              {item.members.map((m, i) => (
                <Text key={i} variant="bodySmall" style={styles.memberText}>{m.firstName} {m.lastName}</Text>
              ))}
            </>
          )}

          {item.registeredDate && (
            <Text variant="bodySmall" style={styles.dateText}>
              Registered: {dayjs(item.registeredDate).format("LL")}
            </Text>
          )}

          {!isCancelled && (
            <Button mode="text" textColor="#F44336" onPress={() => handleCancel(item.id)} style={styles.cancelButton} icon="cancel" compact>
              Cancel Registration
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  const activeRegs = registrations.filter((r) => r.status !== "cancelled");
  const cancelledRegs = registrations.filter((r) => r.status === "cancelled");
  const allSorted = [...activeRegs, ...cancelledRegs];

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <MainHeader title="My Registrations" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => navigateBack()} />
        <LoadingWrapper loading={loading}>
          {registrations.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-available" size={48} color="#CCC" />
              <Text variant="bodyMedium" style={styles.emptyText}>You haven't registered for any events yet.</Text>
            </View>
          ) : (
            <FlatList
              data={allSorted}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </LoadingWrapper>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F6F8" },
  listContent: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 12, backgroundColor: "#FFF", borderRadius: 12, elevation: 2 },
  cancelledCard: { opacity: 0.6 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  eventTitle: { fontWeight: "600", color: "#3c3c3c", flex: 1, marginRight: 8 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  timeText: { color: "#666" },
  divider: { marginVertical: 8 },
  membersLabel: { fontWeight: "600", color: "#3c3c3c", marginBottom: 4 },
  memberText: { color: "#666", marginLeft: 8 },
  dateText: { color: "#999", marginTop: 8, fontSize: 11 },
  cancelButton: { marginTop: 8, alignSelf: "flex-start" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyText: { color: "#999", marginTop: 12, textAlign: "center" }
});

export default Registrations;

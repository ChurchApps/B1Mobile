import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "../../helpers/dayjsConfig";
import DatePicker from "react-native-date-picker";
import { useTranslation } from "react-i18next";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import { Card, Button } from "react-native-paper";
import { InlineLoader } from "../common/LoadingComponents";
import { ApiHelper } from "@churchapps/helpers";

interface BlockoutDate {
  churchId: string;
  id: string;
  personId: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export const BlockoutDates = () => {
  const { t } = useTranslation();
  const fadeAnim = new Animated.Value(0);
  const currentUserChurch = useCurrentUserChurch();

  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  const { data: blockoutDates = [], isLoading: blockoutLoading } = useQuery({
    queryKey: ["/blockoutdates/my", "DoingApi"],
    enabled: !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 10 * 60 * 1000
  });

  const showLoading = blockoutLoading;
  const today = dayjs();
  const upcomingBlockoutDates = blockoutDates.filter((date: BlockoutDate) => dayjs(date.endDate).isAfter(today) || dayjs(date.endDate).isSame(today, "day"));

  const deleteBlockout = (id: string) => {
    Alert.alert(t("plans.deleteBlockout"), t("plans.deleteBlockoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await ApiHelper.delete("/blockoutDates/" + id, "DoingApi");
          } catch (err) {
            console.error("Error deleting blockout:", err);
          }
        }
      }
    ]);
  };

  const saveBlockout = async () => {
    try {
      const blockoutDate = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };
      await ApiHelper.post("/blockoutDates", [blockoutDate], "DoingApi");
      setShowForm(false);
    } catch (err) {
      console.error("Error adding blockout:", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="event-busy" style={styles.headerIcon} size={24} />
        <Text style={styles.headerTitle}>{t("plans.blockoutDates")}</Text>
      </View>

      <Card style={styles.contentCard}>
        <Card.Content>
          {showLoading ? (
            <InlineLoader size="large" text={t("plans.loadingBlockoutDates")} />
          ) : showForm ? (
            <View>
              <Text style={styles.formLabel}>{t("plans.startDate")}</Text>
              <TouchableOpacity style={styles.input} onPress={() => setOpenStartPicker(true)}>
                <Text>{dayjs(startDate).format("YYYY-MM-DD")}</Text>
              </TouchableOpacity>
              <DatePicker
                modal
                mode="date"
                open={openStartPicker}
                date={startDate}
                onConfirm={date => {
                  setOpenStartPicker(false);
                  setStartDate(date);
                }}
                onCancel={() => setOpenStartPicker(false)}
              />

              <Text style={styles.formLabel}>{t("plans.endDate")}</Text>
              <TouchableOpacity style={styles.input} onPress={() => setOpenEndPicker(true)}>
                <Text>{dayjs(endDate).format("YYYY-MM-DD")}</Text>
              </TouchableOpacity>
              <DatePicker
                modal
                mode="date"
                open={openEndPicker}
                date={endDate}
                onConfirm={date => {
                  setOpenEndPicker(false);
                  setEndDate(date);
                }}
                onCancel={() => setOpenEndPicker(false)}
              />

              <View style={styles.formButtons}>
                <Button mode="contained" onPress={saveBlockout}>
                  {t("common.save")}
                </Button>
                <Button mode="outlined" onPress={() => setShowForm(false)}>
                  {t("common.cancel")}
                </Button>
              </View>
            </View>
          ) : upcomingBlockoutDates.length === 0 ? (
            <View style={styles.emptyStateContent}>
              <MaterialIcons name="event-busy" size={48} color="#9E9E9E" />
              <Text style={styles.emptyStateText}>{t("plans.noBlockoutDatesSet")}</Text>
              <Text style={styles.emptyStateSubtext}>{t("plans.blockDatesUnavailable")}</Text>
              <Button mode="contained" onPress={() => setShowForm(true)} style={styles.addButton} labelStyle={styles.addButtonText} icon="plus">
                {t("plans.addBlockoutDate")}
              </Button>
            </View>
          ) : (
            <View style={styles.cardsList}>
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>
                  {t("plans.blockoutDateCount", { count: upcomingBlockoutDates.length })}
                </Text>
                <Button mode="text" onPress={() => setShowForm(true)} labelStyle={{ color: "#0D47A1" }} icon="plus">
                  {t("plans.addNew")}
                </Button>
              </View>

              {upcomingBlockoutDates.map((date: BlockoutDate) => (
                <Card key={date.id} style={styles.blockoutCard} mode="elevated">
                  <Card.Content style={styles.cardContent}>
                    <View style={styles.dateSection}>
                      <View style={styles.dateHeader}>
                        <MaterialIcons name="event-busy" size={20} color="#B0120C" />
                        <Text style={styles.dateRange}>
                          {dayjs(date.startDate).format("ll")}
                          {date.endDate && date.endDate !== date.startDate && ` - ${dayjs(date.endDate).format("ll")}`}
                        </Text>
                      </View>

                      {date.notes && (
                        <View style={styles.notesContainer}>
                          <MaterialIcons name="note" size={16} color="#9E9E9E" />
                          <Text style={styles.notesText}>{date.notes}</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteBlockout(date.id)}>
                      <MaterialIcons name="delete-outline" size={24} color="#B0120C" />
                    </TouchableOpacity>
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingLeft: 4
  },
  headerIcon: {
    color: "#0D47A1",
    marginRight: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3c3c3c"
  },
  contentCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    backgroundColor: "#FFFFFF"
  },
  emptyStateContent: {
    alignItems: "center",
    padding: 32
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3c3c3c",
    marginTop: 16
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 8,
    marginBottom: 24
  },
  addButton: {
    backgroundColor: "#0D47A1",
    borderRadius: 12
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600"
  },
  cardsList: { gap: 12 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  listHeaderText: {
    fontSize: 14,
    color: "#9E9E9E",
    fontWeight: "500"
  },
  blockoutCard: {
    borderRadius: 16,
    elevation: 2,
    backgroundColor: "#FFFFFF"
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4
  },
  dateSection: {
    flex: 1,
    marginRight: 12,
    justifyContent: "center"
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  dateRange: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3c3c3c",
    marginLeft: 8
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(158, 158, 158, 0.08)",
    padding: 12,
    borderRadius: 8,
    marginTop: 8
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 16
  },
  formLabel: {
    fontWeight: "600",
    marginTop: 8
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16
  }
});

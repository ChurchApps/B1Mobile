import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { Constants } from "../../../src/helpers";
import Icons from "react-native-vector-icons/FontAwesome5";
import { ApiHelper } from "../../../src/helpers";
import dayjs from "dayjs";

export const BlockoutDates = () => {
  const [blockoutDates, setBlockoutDates] = useState([]);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  const loadBlockoutDates = async () => {
    try {
      const data = await ApiHelper.get("/blockoutdates/my", "DoingApi");
      setBlockoutDates(data);
    } catch (error) {
      console.error("Error loading blockout dates:", error);
    }
  };

  useEffect(() => {
    loadBlockoutDates();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icons name="calendar-times" style={styles.headerIcon} size={DimensionHelper.wp(5.5)} />
        <Text style={styles.headerTitle}>Blockout Dates</Text>
      </View>

      {blockoutDates.length === 0 ? (
        <View style={styles.emptyState}>
          <Icons name="calendar-minus" size={DimensionHelper.wp(8)} color="#ccc" />
          <Text style={styles.emptyStateText}>No blockout dates set</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              /* TODO: Add navigation to blockout dates creation */
            }}>
            <Icons name="plus" size={14} color="white" style={styles.addButtonIcon} />
            <Text style={styles.addButtonText}>Add Blockout Date</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {blockoutDates.map((date: any, index: number) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.dateInfo}>
                  <Icons name="calendar-day" size={16} color="#1976d2" style={styles.icon} />
                  <Text style={{ fontSize: 16, color: "#222", fontWeight: "bold" }}>{dayjs(date.startDate).format("YYYY-MM-DD")}</Text>
                  {date.endDate && date.endDate !== date.startDate && (
                    <>
                      <Text style={styles.dateSeparator}>to</Text>
                      <Text style={{ fontSize: 16, color: "#222", fontWeight: "bold" }}>{dayjs(date.endDate).format("YYYY-MM-DD")}</Text>
                    </>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    /* TODO: Add delete functionality */
                  }}>
                  <Icons name="trash-alt" size={16} color={Constants.Colors.button_red} />
                </TouchableOpacity>
              </View>
              {date.notes && <Text style={styles.notesText}>{date.notes}</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DimensionHelper.hp(3)
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DimensionHelper.hp(2)
  },
  headerIcon: {
    color: Constants.Colors.app_color,
    marginRight: DimensionHelper.wp(2)
  },
  headerTitle: {
    fontSize: DimensionHelper.wp(4.5),
    fontWeight: "600",
    color: "#333"
  },
  emptyState: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: DimensionHelper.wp(6),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  emptyStateText: {
    fontSize: DimensionHelper.wp(3.5),
    color: "#666",
    marginTop: DimensionHelper.hp(2),
    marginBottom: DimensionHelper.hp(3)
  },
  addButton: {
    backgroundColor: Constants.Colors.app_color,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DimensionHelper.wp(4),
    paddingVertical: DimensionHelper.hp(1),
    borderRadius: 20
  },
  addButtonIcon: {
    marginRight: 8
  },
  addButtonText: {
    color: "white",
    fontSize: DimensionHelper.wp(3.2),
    fontWeight: "500"
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: DimensionHelper.wp(4),
    marginBottom: DimensionHelper.hp(1.5),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center"
  },
  icon: {
    marginRight: 8
  },
  dateText: {
    fontSize: DimensionHelper.wp(3.5),
    color: "#333"
  },
  dateSeparator: {
    fontSize: DimensionHelper.wp(3.2),
    color: "#666",
    marginHorizontal: 8
  },
  deleteButton: {
    padding: 8
  },
  notesText: {
    fontSize: DimensionHelper.wp(3.2),
    color: "#666",
    marginTop: 6,
    marginLeft: 28
  }
});

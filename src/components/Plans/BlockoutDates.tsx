import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import { Card, Button } from "react-native-paper";
import { InlineLoader } from "../common/LoadingComponents";

interface Props {
  isLoading?: boolean;
}

export const BlockoutDates = ({ isLoading = false }: Props) => {
  const fadeAnim = new Animated.Value(0);
  const currentUserChurch = useCurrentUserChurch();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  // Use react-query for blockout dates
  const { data: blockoutDates = [], isLoading: blockoutLoading } = useQuery({
    queryKey: ["/blockoutdates/my", "DoingApi"],
    enabled: !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes - blockout dates don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    onError: error => {
      console.error("Error loading blockout dates:", error);
    }
  });

  const showLoading = isLoading || blockoutLoading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="event-busy" style={styles.headerIcon} size={24} />
        <Text style={styles.headerTitle}>Blockout Dates</Text>
      </View>

      <Card style={styles.contentCard}>
        <Card.Content>
          {showLoading ? (
            <InlineLoader size="large" text="Loading blockout dates..." />
          ) : blockoutDates.length === 0 ? (
            <View style={styles.emptyStateContent}>
              <MaterialIcons name="event-busy" size={48} color="#9E9E9E" />
              <Text style={styles.emptyStateText}>No blockout dates set</Text>
              <Text style={styles.emptyStateSubtext}>Block dates when you're unavailable to serve</Text>
              <Button
                mode="contained"
                onPress={() => {
                  /* TODO: Add navigation to blockout dates creation */
                }}
                style={styles.addButton}
                labelStyle={styles.addButtonText}
                icon="plus">
                Add Blockout Date
              </Button>
            </View>
          ) : (
        <View style={styles.cardsList}>
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>
              {blockoutDates.length} blockout date{blockoutDates.length > 1 ? "s" : ""}
            </Text>
            <Button
              mode="text"
              onPress={() => {
                /* TODO: Add navigation to blockout dates creation */
              }}
              labelStyle={{ color: "#0D47A1" }}
              icon="plus">
              Add New
            </Button>
          </View>

          {blockoutDates.map((date: any, index: number) => (
            <Card key={index} style={styles.blockoutCard} mode="elevated">
              <Card.Content style={styles.cardContent}>
                <View style={styles.dateSection}>
                  <View style={styles.dateHeader}>
                    <MaterialIcons name="event-busy" size={20} color="#B0120C" />
                    <Text style={styles.dateRange}>
                      {dayjs(date.startDate).format("MMM DD, YYYY")}
                      {date.endDate && date.endDate !== date.startDate && ` - ${dayjs(date.endDate).format("MMM DD, YYYY")}`}
                    </Text>
                  </View>

                  {date.notes && (
                    <View style={styles.notesContainer}>
                      <MaterialIcons name="note" size={16} color="#9E9E9E" />
                      <Text style={styles.notesText}>{date.notes}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    /* TODO: Add delete functionality */
                  }}>
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
  container: {
    marginBottom: 24
  },
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

  // Content Card
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
    marginTop: 16,
    textAlign: "center"
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 8,
    marginBottom: 24,
    textAlign: "center"
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

  // Cards List
  cardsList: {
    gap: 12
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4
  },
  listHeaderText: {
    fontSize: 14,
    color: "#9E9E9E",
    fontWeight: "500"
  },

  blockoutCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    backgroundColor: "#FFFFFF"
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 4
  },

  // Date Section
  dateSection: {
    flex: 1,
    marginRight: 12
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8
  },
  dateRange: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3c3c3c",
    marginLeft: 8,
    flex: 1
  },

  // Notes
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(158, 158, 158, 0.08)",
    padding: 12,
    borderRadius: 8
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18
  },

  // Delete Button
  deleteButton: {
    padding: 8,
    borderRadius: 8
  }
});

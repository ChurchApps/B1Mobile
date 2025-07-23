import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, Chip, IconButton, Divider } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import dayjs from "dayjs";
import { EventModal } from "../eventCalendar/EventModal";
import { EventInterface } from "../../mobilehelper";

interface GroupEventModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedEvents: EventInterface[];
  groupId: string;
  isLeader: boolean;
}

export const GroupEventModal: React.FC<GroupEventModalProps> = ({
  isVisible,
  onClose,
  selectedDate,
  selectedEvents,
  groupId,
  isLeader
}) => {
  const handleEditEvent = (event: EventInterface) => {
    onClose();
    router.navigate({
      pathname: "/(drawer)/createEvent",
      params: { 
        event: JSON.stringify(event),
        groupId: groupId
      }
    });
  };

  return (
    <EventModal isVisible={isVisible} close={onClose}>
      <View style={styles.eventModalContent}>
        <View style={styles.eventModalHeader}>
          <Text variant="headlineSmall" style={styles.eventModalTitle}>
            {dayjs(selectedDate).format("MMMM D, YYYY")} Events
          </Text>
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
            style={styles.eventModalClose}
          />
        </View>
        
        <Divider style={styles.eventModalDivider} />
        
        <View style={styles.eventsContainer}>
          {selectedEvents &&
            selectedEvents.map((event: EventInterface, index: number) => (
              <Card key={event.id || index} style={styles.eventCard}>
                <Card.Content style={styles.eventCardContent}>
                  <View style={styles.eventHeader}>
                    <Text variant="titleMedium" style={styles.eventTitle}>
                      {event.title}
                    </Text>
                    <View style={styles.eventHeaderActions}>
                      {event.visibility === "private" && (
                        <Chip compact icon="lock" style={styles.privateChip}>
                          Private
                        </Chip>
                      )}
                      {isLeader && (
                        <IconButton
                          icon="pencil"
                          size={20}
                          iconColor="#0D47A1"
                          onPress={() => handleEditEvent(event)}
                          style={styles.editEventButton}
                          mode="contained-tonal"
                        />
                      )}
                    </View>
                  </View>
                  
                  {event.description && (
                    <Text variant="bodyMedium" style={styles.eventDescription}>
                      {event.description}
                    </Text>
                  )}
                  
                  <View style={styles.eventDetails}>
                    <View style={styles.eventTime}>
                      <MaterialIcons name="access-time" size={16} color="#666" />
                      <Text variant="bodySmall" style={styles.eventTimeText}>
                        {event.allDay 
                          ? "All day" 
                          : `${dayjs(event.start).format("h:mm A")} - ${dayjs(event.end).format("h:mm A")}`
                        }
                      </Text>
                    </View>
                    
                    {event.recurrenceRule && (
                      <View style={styles.eventRecurrence}>
                        <MaterialIcons name="repeat" size={16} color="#666" />
                        <Text variant="bodySmall" style={styles.eventRecurrenceText}>
                          Recurring
                        </Text>
                      </View>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))}
        </View>
      </View>
    </EventModal>
  );
};

const styles = StyleSheet.create({
  eventModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 0,
    maxHeight: "80%",
    minWidth: "90%"
  },
  eventModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  eventModalTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    flex: 1
  },
  eventModalClose: {
    margin: 0
  },
  eventModalDivider: {
    marginBottom: 8
  },
  eventsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  eventCard: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  eventCardContent: {
    padding: 16
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  eventTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    flex: 1,
    marginRight: 8
  },
  eventHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  editEventButton: {
    margin: 0
  },
  privateChip: {
    backgroundColor: "#FFF3E0",
    borderColor: "#FF9800"
  },
  eventDescription: {
    color: "#666",
    marginBottom: 12,
    lineHeight: 20
  },
  eventDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  eventTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  eventTimeText: {
    color: "#666",
    fontSize: 12
  },
  eventRecurrence: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  eventRecurrenceText: {
    color: "#666",
    fontSize: 12
  }
});
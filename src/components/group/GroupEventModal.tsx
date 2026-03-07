import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, Card, Chip, IconButton, Divider } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import dayjs from "../../helpers/dayjsConfig";
import { EventModal } from "../eventCalendar/EventModal";
import { EventInterface } from "@churchapps/helpers";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import { useThemeColors } from "../../theme";

interface GroupEventModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedEvents: EventInterface[];
  groupId: string;
  isLeader: boolean;
}

export const GroupEventModal: React.FC<GroupEventModalProps> = ({ isVisible, onClose, selectedDate, selectedEvents, groupId, isLeader }) => {
  const currentUserChurch = useCurrentUserChurch();
  const colors = useThemeColors();

  const handleRegister = (event: EventInterface) => {
    onClose();
    router.navigate({ pathname: "/registerEventRoot", params: { eventId: event.id, churchId: currentUserChurch?.church?.id || "" } });
  };

  const handleEditEvent = (event: EventInterface) => {
    onClose();
    router.navigate({ pathname: "/createEventRoot", params: { event: JSON.stringify(event), groupId: groupId } });
  };

  return (
    <EventModal isVisible={isVisible} close={onClose}>
      <View style={[styles.eventModalContent, { backgroundColor: colors.card }]}>
        <View style={styles.eventModalHeader}>
          <Text variant="headlineSmall" style={[styles.eventModalTitle, { color: colors.text }]}>
            {dayjs(selectedDate).format("LL")}
          </Text>
          <IconButton icon="close" size={24} onPress={onClose} style={styles.eventModalClose} />
        </View>

        <Divider style={styles.eventModalDivider} />

        <View style={styles.eventsContainer}>
          {selectedEvents &&
            selectedEvents.map((event: EventInterface, index: number) => (
              <Card key={event.id || index} style={[styles.eventCard, { backgroundColor: colors.card, shadowColor: colors.shadowBlack }]}>
                <Card.Content style={styles.eventCardContent}>
                  <View style={styles.eventHeader}>
                    <Text variant="titleMedium" style={[styles.eventTitle, { color: colors.text }]}>
                      {event.title}
                    </Text>
                    <View style={styles.eventHeaderActions}>
                      {event.visibility === "private" && (
                        <Chip compact icon="lock" style={[styles.privateChip, { backgroundColor: colors.warningBg, borderColor: colors.warning }]}>
                          Private
                        </Chip>
                      )}
                      {isLeader && <IconButton icon="pencil" size={20} iconColor={colors.primary} onPress={() => handleEditEvent(event)} style={styles.editEventButton} mode="contained-tonal" />}
                    </View>
                  </View>

                  {event.description && (
                    <Text variant="bodyMedium" style={[styles.eventDescription, { color: colors.textMuted }]}>
                      {event.description}
                    </Text>
                  )}

                  <View style={styles.eventDetails}>
                    <View style={styles.eventTime}>
                      <MaterialIcons name="access-time" size={16} color={colors.textMuted} />
                      <Text variant="bodySmall" style={[styles.eventTimeText, { color: colors.textMuted }]}>
                        {event.allDay ? "All day" : `${dayjs(event.start).format("LT")} - ${dayjs(event.end).format("LT")}`}
                      </Text>
                    </View>

                    {event.recurrenceRule && (
                      <View style={styles.eventRecurrence}>
                        <MaterialIcons name="repeat" size={16} color={colors.textMuted} />
                        <Text variant="bodySmall" style={[styles.eventRecurrenceText, { color: colors.textMuted }]}>
                          Recurring
                        </Text>
                      </View>
                    )}
                  </View>

                  {event.registrationEnabled && (
                    <Button mode="contained" icon="account-check" onPress={() => handleRegister(event)} style={[styles.registerButton, { backgroundColor: colors.primary }]} compact>
                      Register
                    </Button>
                  )}
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
    fontWeight: "600",
    flex: 1
  },
  eventModalClose: { margin: 0 },
  eventModalDivider: { marginBottom: 8 },
  eventsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  eventCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  eventCardContent: { padding: 16 },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  eventTitle: {
    fontWeight: "600",
    flex: 1,
    marginRight: 8
  },
  eventHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  editEventButton: { margin: 0 },
  privateChip: { borderWidth: 1 },
  eventDescription: {
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
  eventTimeText: { fontSize: 12 },
  eventRecurrence: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  eventRecurrenceText: { fontSize: 12 },
  registerButton: {
    marginTop: 12,
    alignSelf: "flex-start"
  }
});

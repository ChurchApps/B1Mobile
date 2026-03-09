import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { EventInterface } from "@churchapps/helpers";
import { router } from "expo-router";
import dayjs from "../../helpers/dayjsConfig";
import { useThemeColors } from "../../theme";
import { useCurrentUserChurch, useUser } from "../../stores/useUserStore";
import { useTranslation } from "react-i18next";

export const UpcomingEventsList: React.FC = () => {
  const { t } = useTranslation();
  const tc = useThemeColors();
  const user = useUser();
  const currentUserChurch = useCurrentUserChurch();

  const { data: events = [] } = useQuery<EventInterface[]>({
    queryKey: ["/events/registerable", "ContentApi"],
    enabled: !!user?.jwt,
    placeholderData: [],
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });

  if (events.length === 0) return null;

  const handleRegister = (event: EventInterface) => {
    router.navigate({ pathname: "/registerEventRoot", params: { eventId: event.id, churchId: currentUserChurch?.church?.id || "" } });
  };

  const formatEventTime = (event: EventInterface) => {
    if (event.allDay) return dayjs(event.start).format("MMM D, YYYY") + " (All day)";
    const start = dayjs(event.start);
    const end = dayjs(event.end);
    if (start.isSame(end, "day")) {
      return start.format("MMM D, YYYY") + "  " + start.format("h:mm A") + " - " + end.format("h:mm A");
    }
    return start.format("MMM D h:mm A") + " - " + end.format("MMM D h:mm A");
  };

  return (
    <View style={styles.section}>
      <Text variant="titleLarge" style={[styles.sectionTitle, { color: tc.text }]}>
        {t("events.upcomingEvents")}
      </Text>
      {events.map((event) => (
        <Card key={event.id} style={[styles.card, { backgroundColor: tc.surface }]}>
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text variant="titleMedium" style={[styles.title, { color: tc.text }]} numberOfLines={2}>
                {event.title}
              </Text>
              <Text variant="bodySmall" style={[styles.time, { color: tc.textSecondary }]}>
                {formatEventTime(event)}
              </Text>
              {event.description ? (
                <Text variant="bodySmall" style={[styles.description, { color: tc.textSecondary }]} numberOfLines={2}>
                  {event.description}
                </Text>
              ) : null}
            </View>
            <Button mode="contained" compact onPress={() => handleRegister(event)} style={[styles.registerButton, { backgroundColor: tc.success }]}>
              {t("events.register")}
            </Button>
          </View>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 16,
    paddingLeft: 4
  },
  card: {
    overflow: "hidden",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 12
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center"
  },
  textContainer: {
    flex: 1,
    marginRight: 12
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2
  },
  time: {
    fontSize: 12,
    marginBottom: 2
  },
  description: { fontSize: 12 },
  registerButton: {}
});

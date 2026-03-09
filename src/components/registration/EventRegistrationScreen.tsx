import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Alert } from "react-native";
import { Button, Card, Chip, Divider, IconButton, ProgressBar, Text, TextInput } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ApiHelper } from "@churchapps/helpers";
import { EventInterface, RegistrationInterface } from "@churchapps/helpers";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import dayjs from "../../helpers/dayjsConfig";
import { useThemeColors, CommonStyles } from "../../theme";

interface GuestMember {
  firstName: string;
  lastName: string;
}

interface Props {
  eventId: string;
  churchId: string;
  onDone: () => void;
}

export const EventRegistrationScreen: React.FC<Props> = ({ eventId, churchId, onDone }) => {
  const colors = useThemeColors();
  const currentUserChurch = useCurrentUserChurch();
  const isLoggedIn = !!currentUserChurch?.person?.id;

  const [event, setEvent] = useState<EventInterface | null>(null);
  const [step, setStep] = useState<"info" | "members" | "confirm">("info");
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [members, setMembers] = useState<GuestMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [registration, setRegistration] = useState<RegistrationInterface | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventData, countData] = await Promise.all([
          ApiHelper.getAnonymous("/events/public/" + churchId + "/" + eventId, "ContentApi"),
          ApiHelper.getAnonymous("/registrations/event/" + eventId + "/count?churchId=" + churchId, "ContentApi")
        ]);
        setEvent(eventData);
        setActiveCount(countData?.count || 0);
      } catch {
        Alert.alert("Error", "Could not load event details.");
      }
      setLoading(false);
    };
    load();
  }, [eventId, churchId]);

  if (loading) return <View style={[CommonStyles.centerContainer, { padding: 32 }]}><Text>Loading...</Text></View>;
  if (!event) return <View style={[CommonStyles.centerContainer, { padding: 32 }]}><Text>Event not found.</Text></View>;

  const isFull = event.capacity ? activeCount >= event.capacity : false;
  const now = new Date();
  const isOpen = (!event.registrationOpenDate || new Date(event.registrationOpenDate) <= now)
    && (!event.registrationCloseDate || new Date(event.registrationCloseDate) >= now);

  if (!event.registrationEnabled) return <View style={[CommonStyles.centerContainer, { padding: 32 }]}><Text>Registration is not available for this event.</Text></View>;

  if (!isOpen) {
    return (
      <View style={[CommonStyles.centerContainer, { padding: 32 }]}>
        <MaterialIcons name="event-busy" size={48} color={colors.textHint} />
        <Text variant="titleMedium" style={[styles.statusTitle, { color: colors.text }]}>Registration Not Open</Text>
        <Text variant="bodySmall" style={[CommonStyles.textCenter, { color: colors.textMuted, marginBottom: 8 }]}>
          {event.registrationOpenDate && new Date(event.registrationOpenDate) > now
            ? `Registration opens ${dayjs(event.registrationOpenDate).format("LL")}`
            : "Registration for this event has closed."}
        </Text>
      </View>
    );
  }

  if (isFull) {
    return (
      <View style={[CommonStyles.centerContainer, { padding: 32 }]}>
        <MaterialIcons name="group-off" size={48} color={colors.error} />
        <Text variant="titleMedium" style={[styles.statusTitle, { color: colors.text }]}>Event Full</Text>
        <Text variant="bodySmall" style={[CommonStyles.textCenter, { color: colors.textMuted, marginBottom: 8 }]}>
          This event has reached its capacity of {event.capacity}.
        </Text>
      </View>
    );
  }

  // Confirmation step
  if (step === "confirm" && registration) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[CommonStyles.centerContainer, { padding: 32 }]}>
          <MaterialIcons name="check-circle" size={48} color={colors.success} />
          <Text variant="headlineSmall" style={[styles.confirmTitle, { color: colors.text }]}>Registration Confirmed!</Text>
          <Text variant="bodyMedium" style={[CommonStyles.textCenter, { color: colors.textMuted, marginBottom: 8 }]}>You are registered for {event.title}</Text>
        </View>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Text variant="bodyMedium"><Text style={styles.bold}>Event: </Text>{event.title}</Text>
            {event.start && <Text variant="bodySmall" style={[styles.detailText, { color: colors.textMuted }]}>{dayjs(event.start).format("LLL")}</Text>}
            <Chip compact style={[styles.statusChip, { backgroundColor: `${colors.success}22` }]} textStyle={{ color: colors.success }}>{registration.status}</Chip>
            {registration.members && registration.members.length > 0 && (
              <>
                <Divider style={styles.divider} />
                <Text variant="bodySmall" style={styles.bold}>Registered Members:</Text>
                {registration.members.map((m, i) => (
                  <Text key={i} variant="bodySmall" style={[styles.memberText, { color: colors.textMuted }]}>- {m.firstName} {m.lastName}</Text>
                ))}
              </>
            )}
          </Card.Content>
        </Card>
        <Button mode="contained" onPress={onDone} style={[styles.actionButton, { backgroundColor: colors.primary }]}>Done</Button>
      </ScrollView>
    );
  }

  const addMember = () => {
    if (members.length >= 10) return;
    const lastName = isLoggedIn ? (currentUserChurch?.person?.name?.last || "") : guestLastName;
    setMembers([...members, { firstName: "", lastName }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof GuestMember, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleContinue = () => {
    if (!isLoggedIn) {
      if (!guestFirstName.trim() || !guestLastName.trim()) { Alert.alert("Required", "First and last name are required."); return; }
      if (!guestEmail.trim()) { Alert.alert("Required", "Email is required for guest registration."); return; }
    }
    setStep("members");
  };

  const handleSubmit = async () => {
    for (const m of members) {
      if (!m.firstName.trim() || !m.lastName.trim()) {
        Alert.alert("Required", "First and last name are required for each additional member.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = { churchId, eventId };
      if (isLoggedIn) {
        payload.personId = currentUserChurch.person.id;
      } else {
        payload.guestInfo = { firstName: guestFirstName.trim(), lastName: guestLastName.trim(), email: guestEmail.trim(), phone: guestPhone.trim() || undefined };
      }
      if (members.length > 0) {
        payload.members = members.map((m) => ({ firstName: m.firstName.trim(), lastName: m.lastName.trim() }));
      }

      const result = await ApiHelper.postAnonymous("/registrations/register", payload, "ContentApi");
      setRegistration(result);
      setStep("confirm");
    } catch {
      Alert.alert("Error", "Registration failed. The event may be full or registration may have closed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Members step
  if (step === "members") {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: colors.text }]}>Additional Members</Text>
        <Text variant="bodySmall" style={[CommonStyles.textCenter, { color: colors.textMuted, marginBottom: 8 }]}>Optionally register additional family members for this event.</Text>

        {members.map((member, index) => (
          <View key={index} style={[CommonStyles.row, { marginBottom: 8 }]}>
            <View style={[CommonStyles.row, { flex: 1, gap: 8 }]}>
              <TextInput label="First Name" value={member.firstName} onChangeText={(v) => updateMember(index, "firstName", v)} mode="outlined" dense style={[styles.input, { backgroundColor: colors.surface }]} />
              <TextInput label="Last Name" value={member.lastName} onChangeText={(v) => updateMember(index, "lastName", v)} mode="outlined" dense style={[styles.input, { backgroundColor: colors.surface }]} />
            </View>
            <IconButton icon="close" size={20} onPress={() => removeMember(index)} />
          </View>
        ))}

        <Button mode="outlined" icon="account-plus" onPress={addMember} disabled={members.length >= 10} style={styles.addButton} compact>
          Add Member
        </Button>

        <View style={[CommonStyles.row, { gap: 8, marginTop: 16 }]}>
          <Button mode="outlined" onPress={() => setStep("info")} style={styles.backButton}>Back</Button>
          <Button mode="contained" onPress={handleSubmit} loading={isSubmitting} disabled={isSubmitting} style={[styles.submitButton, { backgroundColor: colors.primary }]} icon="check">
            {isSubmitting ? "Registering..." : "Complete Registration"}
          </Button>
        </View>
      </ScrollView>
    );
  }

  // Info step (default)
  const capacityPct = event.capacity ? Math.min(activeCount / event.capacity, 1) : 0;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text variant="headlineSmall" style={[styles.sectionTitle, { color: colors.text }]}>{event.title}</Text>
          {event.start && (
            <View style={[CommonStyles.row, { gap: 4, marginBottom: 8 }]}>
              <MaterialIcons name="access-time" size={16} color={colors.textMuted} />
              <Text variant="bodySmall" style={[styles.timeText, { color: colors.textMuted }]}>
                {event.allDay ? dayjs(event.start).format("LL") : `${dayjs(event.start).format("LLL")} - ${dayjs(event.end).format("LT")}`}
              </Text>
            </View>
          )}
          {event.description && <Text variant="bodyMedium" style={[styles.description, { color: colors.text }]}>{event.description}</Text>}

          {event.capacity && (
            <View style={styles.capacitySection}>
              <Text variant="bodySmall" style={[styles.capacityText, { color: colors.textMuted }]}>{activeCount} / {event.capacity} spots filled</Text>
              <ProgressBar progress={capacityPct} color={capacityPct >= 0.9 ? colors.warning : colors.primary} style={styles.progressBar} />
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          {isLoggedIn ? (
            <>
              <Text variant="bodySmall" style={[styles.label, { color: colors.textMuted }]}>Registering as:</Text>
              <Text variant="titleMedium" style={[styles.registrantName, { color: colors.text }]}>{currentUserChurch?.person?.name?.display || ""}</Text>
            </>
          ) : (
            <>
              <Text variant="bodySmall" style={[styles.label, { color: colors.textMuted }]}>Your Information:</Text>
              <View style={[CommonStyles.row, { gap: 8, marginBottom: 8 }]}>
                <TextInput label="First Name" value={guestFirstName} onChangeText={setGuestFirstName} mode="outlined" dense style={[styles.input, { backgroundColor: colors.surface }]} />
                <TextInput label="Last Name" value={guestLastName} onChangeText={setGuestLastName} mode="outlined" dense style={[styles.input, { backgroundColor: colors.surface }]} />
              </View>
              <View style={[CommonStyles.row, { gap: 8, marginBottom: 8 }]}>
                <TextInput label="Email" value={guestEmail} onChangeText={setGuestEmail} mode="outlined" dense style={[styles.input, { backgroundColor: colors.surface }]} keyboardType="email-address" autoCapitalize="none" />
                <TextInput label="Phone" value={guestPhone} onChangeText={setGuestPhone} mode="outlined" dense style={[styles.input, { backgroundColor: colors.surface }]} keyboardType="phone-pad" />
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={handleContinue} style={[styles.actionButton, { backgroundColor: colors.primary }]} icon="arrow-right" contentStyle={styles.buttonContent}>
        Continue
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 16, borderRadius: 12, elevation: 2 },
  sectionTitle: { fontWeight: "700", marginBottom: 8 },
  statusTitle: { fontWeight: "600", marginTop: 12 },
  confirmTitle: { fontWeight: "700", marginTop: 12, marginBottom: 4 },
  statusChip: { alignSelf: "flex-start", marginTop: 8 },
  timeText: {},
  description: { marginVertical: 8, lineHeight: 20 },
  capacitySection: { marginTop: 8 },
  capacityText: { marginBottom: 4 },
  progressBar: { height: 6, borderRadius: 3 },
  label: { marginBottom: 4 },
  registrantName: { fontWeight: "600" },
  input: { flex: 1 },
  actionButton: { marginTop: 8 },
  buttonContent: { flexDirection: "row-reverse" },
  addButton: { marginBottom: 16, alignSelf: "flex-start" },
  backButton: { flex: 0 },
  submitButton: { flex: 1 },
  divider: { marginVertical: 8 },
  bold: { fontWeight: "600" },
  memberText: { marginLeft: 8 },
  detailText: { marginTop: 4 }
});

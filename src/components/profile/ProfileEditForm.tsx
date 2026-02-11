import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, TextInput, Card } from "react-native-paper";
import { PersonInterface } from "../../interfaces";
import { PhotoPicker } from "./PhotoPicker";
import DatePicker from "react-native-date-picker";
import { useTranslation } from "react-i18next";

interface ProfileEditFormProps {
  person: PersonInterface;
  modifiedFields: Set<string>;
  onFieldChange: (key: string, value: string) => void;
  onPhotoChange: (photoUri: string) => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  person,
  modifiedFields,
  onFieldChange,
  onPhotoChange
}) => {
  const { t } = useTranslation();
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const getFieldValue = (key: string): string => {
    const parts = key.split(".");
    let value: any = person;
    for (const part of parts) {
      value = value?.[part];
    }
    if (key === "birthDate" && value) {
      return new Date(value).toLocaleDateString();
    }
    return value || "";
  };

  const isModified = (key: string): boolean => modifiedFields.has(key);

  const renderInput = (
    key: string,
    label: string,
    options?: {
      keyboardType?: "default" | "email-address" | "phone-pad";
      multiline?: boolean;
    }
  ) => (
    <View style={[styles.inputWrapper, isModified(key) && styles.modifiedInput]}>
      <TextInput
        mode="outlined"
        label={label}
        value={getFieldValue(key)}
        onChangeText={(text) => onFieldChange(key, text)}
        keyboardType={options?.keyboardType || "default"}
        multiline={options?.multiline}
        style={styles.input}
        outlineColor={isModified(key) ? "#FFC107" : "#E0E0E0"}
        activeOutlineColor="#0D47A1"
      />
      {isModified(key) && <View style={styles.modifiedIndicator} />}
    </View>
  );

  const birthDate = person?.birthDate ? new Date(person.birthDate) : new Date();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Photo Section */}
      <PhotoPicker
        currentPhotoUri={person?.photo}
        onPhotoSelected={onPhotoChange}
        personName={person?.name?.display}
      />

      {/* Name Section */}
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("profileEdit.name")}
          </Text>
          <View style={styles.row}>
            {renderInput("name.first", t("profileEdit.firstName"))}
          </View>
          <View style={styles.row}>
            {renderInput("name.middle", t("profileEdit.middleName"))}
          </View>
          <View style={styles.row}>
            {renderInput("name.last", t("profileEdit.lastName"))}
          </View>
        </Card.Content>
      </Card>

      {/* Contact Section */}
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("profileEdit.contact")}
          </Text>
          <View style={styles.row}>
            {renderInput("contactInfo.email", t("profileEdit.email"), { keyboardType: "email-address" })}
          </View>
          <View style={[styles.inputWrapper, isModified("birthDate") && styles.modifiedInput]}>
            <TextInput
              mode="outlined"
              label={t("profileEdit.birthDate")}
              value={getFieldValue("birthDate")}
              onFocus={() => setShowDatePicker(true)}
              showSoftInputOnFocus={false}
              style={styles.input}
              outlineColor={isModified("birthDate") ? "#FFC107" : "#E0E0E0"}
              activeOutlineColor="#0D47A1"
              right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
            />
            {isModified("birthDate") && <View style={styles.modifiedIndicator} />}
          </View>
        </Card.Content>
      </Card>

      {/* Address Section */}
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("profileEdit.address")}
          </Text>
          <View style={styles.row}>
            {renderInput("contactInfo.address1", t("profileEdit.addressLine1"))}
          </View>
          <View style={styles.row}>
            {renderInput("contactInfo.address2", t("profileEdit.addressLine2"))}
          </View>
          <View style={styles.row}>
            {renderInput("contactInfo.city", t("profileEdit.city"))}
          </View>
          <View style={styles.rowHalf}>
            <View style={styles.halfInput}>
              {renderInput("contactInfo.state", t("profileEdit.state"))}
            </View>
            <View style={styles.halfInput}>
              {renderInput("contactInfo.zip", t("profileEdit.zip"))}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Phone Section */}
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("profileEdit.phone")}
          </Text>
          <View style={styles.row}>
            {renderInput("contactInfo.mobilePhone", t("profileEdit.mobilePhone"), { keyboardType: "phone-pad" })}
          </View>
          <View style={styles.row}>
            {renderInput("contactInfo.homePhone", t("profileEdit.homePhone"), { keyboardType: "phone-pad" })}
          </View>
          <View style={styles.row}>
            {renderInput("contactInfo.workPhone", t("profileEdit.workPhone"), { keyboardType: "phone-pad" })}
          </View>
        </Card.Content>
      </Card>

      <DatePicker
        modal
        open={showDatePicker}
        date={birthDate}
        mode="date"
        maximumDate={new Date()}
        onConfirm={(date) => {
          setShowDatePicker(false);
          onFieldChange("birthDate", date.toISOString().split("T")[0]);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  section: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF"
  },
  sectionTitle: {
    fontWeight: "600",
    color: "#3c3c3c",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 8
  },
  row: { marginBottom: 12 },
  rowHalf: {
    flexDirection: "row",
    gap: 12
  },
  halfInput: { flex: 1 },
  inputWrapper: { position: "relative" },
  modifiedInput: { borderRadius: 4 },
  modifiedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFC107"
  },
  input: { backgroundColor: "#FFFFFF" },
  bottomPadding: { height: 100 }
});

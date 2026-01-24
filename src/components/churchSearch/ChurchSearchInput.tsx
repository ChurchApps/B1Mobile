import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Card } from "react-native-paper";
import { useTranslation } from "react-i18next";

interface ChurchSearchInputProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
}

export const ChurchSearchInput: React.FC<ChurchSearchInputProps> = ({ searchText, onSearchTextChange }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.searchSection}>
      <Card style={styles.searchCard}>
        <Card.Content style={styles.searchContent}>
          <TextInput
            mode="outlined"
            label={t("churchSearch.searchLabel")}
            placeholder={t("churchSearch.searchPlaceholder")}
            value={searchText}
            onChangeText={onSearchTextChange}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            right={
              searchText.length > 0 ? (
                <TextInput.Icon
                  icon="close-circle"
                  onPress={() => onSearchTextChange("")}
                  forceTextInputFocus={false}
                />
              ) : null
            }
            theme={{
              colors: {
                primary: "#0D47A1",
                outline: "rgba(0, 0, 0, 0.12)"
              }
            }}
          />
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16
  },
  searchCard: {
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  searchContent: {
    padding: 20
  },
  searchInput: {
    backgroundColor: "#FFFFFF"
  }
});
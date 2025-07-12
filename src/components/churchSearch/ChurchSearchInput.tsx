import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Card, Button } from "react-native-paper";

interface ChurchSearchInputProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
}

export const ChurchSearchInput: React.FC<ChurchSearchInputProps> = ({ searchText, onSearchTextChange }) => {
  return (
    <View style={styles.searchSection}>
      <Card style={styles.searchCard}>
        <Card.Content style={styles.searchContent}>
          <TextInput
            mode="outlined"
            label="Church name, city, or zip"
            placeholder="Search for your church"
            value={searchText}
            onChangeText={onSearchTextChange}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            theme={{
              colors: {
                primary: "#0D47A1",
                outline: "rgba(0, 0, 0, 0.12)"
              }
            }}
          />
          {searchText.length > 0 && (
            <Button 
              mode="text" 
              onPress={() => onSearchTextChange("")} 
              style={styles.clearButton} 
              labelStyle={styles.clearButtonText}>
              Clear Search
            </Button>
          )}
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
    backgroundColor: "#FFFFFF",
    marginBottom: 8
  },
  clearButton: {
    alignSelf: "flex-end"
  },
  clearButtonText: {
    color: "#0D47A1",
    fontWeight: "500"
  }
});
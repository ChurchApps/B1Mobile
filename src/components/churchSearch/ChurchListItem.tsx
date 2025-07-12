import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, ActivityIndicator } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { OptimizedImage } from "../OptimizedImage";
import { ArrayHelper, Constants } from "../../helpers";
import { ChurchInterface } from "../../helpers";

interface ChurchListItemProps {
  church: ChurchInterface;
  onPress: (church: ChurchInterface) => void;
  isSelecting: boolean;
}

export const ChurchListItem: React.FC<ChurchListItemProps> = ({ church, onPress, isSelecting }) => {
  const churchImage = (() => {
    // Default to B1 logo
    let image = Constants.Images.logoBlue;

    // Only use church logo if we have a valid setting with value
    if (church.settings && church.settings.length > 0) {
      // Prefer logoDark over favicon
      let setting = ArrayHelper.getOne(church.settings, "keyName", "logoDark");
      if (!setting) {
        setting = ArrayHelper.getOne(church.settings, "keyName", "favicon_400x400");
      }
      if (!setting) setting = church.settings[0];
      if (setting?.value && setting.value.trim() !== "") {
        image = { uri: setting.value };
      }
    }
    return image;
  })();

  return (
    <Card style={styles.churchCard} onPress={() => !isSelecting && onPress(church)}>
      <Card.Content style={styles.churchContent}>
        <View style={styles.churchImageContainer}>
          <OptimizedImage 
            source={churchImage} 
            style={styles.churchImage} 
            placeholder={Constants.Images.logoBlue} 
          />
        </View>
        <View style={styles.churchDetails}>
          <Text variant="titleMedium" style={styles.churchName} numberOfLines={2}>
            {church.name}
          </Text>
          <Text variant="bodySmall" style={styles.churchSubtitle}>
            {isSelecting ? "Connecting..." : "Tap to connect"}
          </Text>
        </View>
        {isSelecting ? (
          <ActivityIndicator size="small" color="#0D47A1" />
        ) : (
          <MaterialIcons name="chevron-right" size={24} color="#9E9E9E" />
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  churchCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  churchContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16
  },
  churchImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: "#F6F6F8"
  },
  churchImage: {
    width: "100%",
    height: "100%"
  },
  churchDetails: {
    flex: 1
  },
  churchName: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 4
  },
  churchSubtitle: {
    color: "#9E9E9E"
  }
});
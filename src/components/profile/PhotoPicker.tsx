import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Avatar } from "../common/Avatar";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";

interface PhotoPickerProps {
  currentPhotoUri?: string;
  onPhotoSelected: (base64DataUrl: string) => void;
  personName?: string;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  currentPhotoUri,
  onPhotoSelected,
  personName
}) => {
  const { t } = useTranslation();
  const { showActionSheetWithOptions } = useActionSheet();
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async (type: "camera" | "gallery"): Promise<boolean> => {
    if (type === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("profileEdit.permissionRequired"),
          t("profileEdit.cameraPermissionMessage")
        );
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("profileEdit.permissionRequired"),
          t("profileEdit.galleryPermissionMessage")
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (useCamera: boolean) => {
    const hasPermission = await requestPermissions(useCamera ? "camera" : "gallery");
    if (!hasPermission) return;

    setIsLoading(true);

    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: false
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Resize to match B1Admin (300px height, proportional width based on 4:3 aspect)
        const targetHeight = 300;
        const targetWidth = Math.round(targetHeight * (4 / 3));

        const manipulated = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: targetWidth, height: targetHeight } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        if (manipulated.base64) {
          const dataUrl = `data:image/jpeg;base64,${manipulated.base64}`;
          onPhotoSelected(dataUrl);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(t("common.error"), t("profileEdit.photoPickError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    const options = [
      t("profileEdit.takePhoto"),
      t("profileEdit.chooseFromGallery"),
      t("common.cancel")
    ];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: t("profileEdit.changePhoto")
      },
      (selectedIndex) => {
        if (selectedIndex === 0) {
          pickImage(true);
        } else if (selectedIndex === 1) {
          pickImage(false);
        }
      }
    );
  };

  const nameParts = personName?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} disabled={isLoading}>
      <View style={styles.avatarContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D47A1" />
          </View>
        ) : (
          <Avatar
            size={120}
            photoUrl={currentPhotoUri}
            firstName={firstName}
            lastName={lastName}
            style={styles.avatar}
          />
        )}
        <View style={styles.editBadge}>
          <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
        </View>
      </View>
      <Text variant="bodySmall" style={styles.hint}>
        {t("profileEdit.tapToChangePhoto")}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 24
  },
  avatarContainer: {
    position: "relative"
  },
  avatar: {
    borderWidth: 3,
    borderColor: "#0D47A1"
  },
  loadingContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F6F6F8",
    justifyContent: "center",
    alignItems: "center"
  },
  editBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0D47A1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF"
  },
  hint: {
    marginTop: 8,
    color: "#9E9E9E"
  }
});

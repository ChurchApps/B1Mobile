import React from "react";
import { Avatar as PaperAvatar } from "react-native-paper";
import { EnvironmentHelper } from "../../helpers";

interface AvatarProps {
  size?: number;
  photoUrl?: string;
  firstName?: string;
  lastName?: string;
  backgroundColor?: string;
  textColor?: string;
  style?: any;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = 40,
  photoUrl,
  firstName,
  lastName,
  backgroundColor = "#0D47A1", // Default blue from theme
  textColor = "#FFFFFF",
  style
}) => {
  // Generate initials from first and last name
  const getInitials = () => {
    const firstInitial = firstName?.[0] || "";
    const lastInitial = lastName?.[0] || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // If photo URL is provided, use Avatar.Image
  if (photoUrl) {
    const imageUri = photoUrl.startsWith("http") ? photoUrl : EnvironmentHelper.ContentRoot + photoUrl;
    return <PaperAvatar.Image size={size} source={{ uri: imageUri }} style={style} />;
  }

  // Otherwise, use Avatar.Text with initials
  return <PaperAvatar.Text size={size} label={getInitials()} style={[{ backgroundColor }, style]} labelStyle={{ color: textColor }} />;
};

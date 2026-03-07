import React from "react";
import { Avatar as PaperAvatar } from "react-native-paper";
import { EnvironmentHelper } from "../../helpers";
import { useThemeColors } from "../../theme";

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
  backgroundColor,
  textColor,
  style
}) => {
  const colors = useThemeColors();

  // Use theme colors as defaults if not provided
  const bgColor = backgroundColor ?? colors.primary;
  const txtColor = textColor ?? colors.onPrimary;

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
  return <PaperAvatar.Text size={size} label={getInitials()} style={[{ backgroundColor: bgColor }, style]} labelStyle={{ color: txtColor }} />;
};

import React from 'react';
import { ImageBackground, StyleSheet, ImageSourcePropType, View, Image } from 'react-native';
import { Text as PaperText, Card, useTheme, TouchableRipple } from 'react-native-paper';
import { DimensionHelper } from '@/src/helpers/DimensionHelper'; // Keep for now if essential for specific sizing

interface Props {
  text: string;
  source?: ImageSourcePropType;
  backgroundImage?: ImageSourcePropType;
  onPress: () => void;
  color?: string; // Optional: if a non-theme color is needed for text. Prefer theme colors.
  style?: object; // Allow passing additional styles
}

export function ImageButton(props: Props) {
  const theme = useTheme();

  // Determine text color: use props.color if provided, otherwise theme's primary or onSurface
  const textColor = props.color || (props.backgroundImage ? theme.colors.surface : theme.colors.primary);
  // For text on a background image, theme.colors.surface (often white) is a good default.
  // For text on a plain card, theme.colors.primary or theme.colors.onSurface could be defaults.

  const styles = StyleSheet.create({
    card: {
      height: DimensionHelper.wp(38), // Retain responsive height for now, can be reviewed
      width: '100%',
      borderRadius: theme.roundness, // Use theme roundness
      // elevation: 3, // Card has its own elevation prop
      overflow: 'hidden', // Important for ImageBackground within Card
      justifyContent: 'center',
      alignItems: 'center',
    },
    // touchableRipple style removed as TouchableRipple component is removed
    imageBackground: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.medium, // Use theme spacing
    },
    contentContainer: { // Used when no background image
      padding: theme.spacing.medium,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
    textStyle: {
      // Use PaperText variants like 'labelLarge', 'titleMedium' etc. for font size and weight
      // Example: { ...theme.fonts.titleMedium, color: textColor, textAlign: 'center' }
      // For now, keeping it simple with direct styling, but variants are preferred.
      textAlign: 'center',
      fontWeight: 'bold', // Consider removing if using a bold variant from PaperText
      color: textColor, // Applied dynamically
    },
    iconImageStyle: {
      width: 40, // Fixed DP value
      height: 40, // Fixed DP value
      marginBottom: theme.spacing.small, // Use theme spacing
      resizeMode: 'contain',
    },
  });

  return (
    <Card style={[styles.card, props.style]} onPress={props.onPress} elevation={3}>
      {props.backgroundImage ? (
        <ImageBackground source={props.backgroundImage} style={styles.imageBackground} resizeMode="cover">
          {/* Optional: Add an overlay View here if needed for text readability */}
          {props.source && <Image source={props.source} style={styles.iconImageStyle} />}
          <PaperText variant="labelLarge" style={[styles.textStyle, { color: textColor }]}>{props.text}</PaperText>
        </ImageBackground>
      ) : (
        <View style={styles.contentContainer}>
          {props.source && <Image source={props.source} style={styles.iconImageStyle} />}
          <PaperText variant="labelLarge" style={[styles.textStyle, { color: textColor }]}>{props.text}</PaperText>
        </View>
      )}
    </Card>
  );
}

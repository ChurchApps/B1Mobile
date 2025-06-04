import * as React from "react";
import { StyleSheet, View, ImageSourcePropType, ImageBackground } from "react-native";
import { Card, Text, useTheme, TouchableRipple } from 'react-native-paper';
import { DimensionHelper } from "@/src/helpers/DimensionHelper"; // Kept for dimensions for now
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  icon?: React.ReactNode,
  text: string,
  onPress: () => void,
  color?: string, // This prop might be re-evaluated. Theme colors should be preferred.
  backgroundImage?: ImageSourcePropType,
}

export function ImageButton(props: Props) {
  const theme = useTheme();

  // Determine text color based on background or props.color
  let textColor = props.color || theme.colors.primary;
  if (props.backgroundImage) {
    textColor = theme.colors.surface; // Or a specific "onImage" color if defined
  }

  const styles = StyleSheet.create({
    card: {
      marginVertical: DimensionHelper.wp(1),
      marginHorizontal: 0,
      width: DimensionHelper.wp(46),
      height: DimensionHelper.wp(46 * (9 / 16)), // Aspect ratio 16:9
      borderRadius: theme.roundness * 2, // Or DimensionHelper.wp(4.5)
      overflow: 'hidden',
      elevation: 4, // Default Card elevation can be used or overridden
    },
    touchable: {
      flex: 1,
      borderRadius: theme.roundness * 2, // Match card's border radius
    },
    backgroundImageStyle: { // Style for the ImageBackground component itself
      flex: 1,
    },
    imageStyle: { // Style for the actual image within ImageBackground
      // resizeMode: 'cover', // Default for ImageBackground
    },
    contentContainer: { // This View is inside ImageBackground or Card for content layout
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: DimensionHelper.wp(2), // General padding
    },
    gradient: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.7, // As per original
    },
    overlay: { // If a simple color overlay is preferred over gradient
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.35)', // As per original
    },
    iconContainer: {
      marginBottom: props.text ? DimensionHelper.wp(1) : 0, // Reduced margin if text follows
      // zIndex: 2, // Not usually needed with Paper components unless specific overlap issues
    },
    text: {
      color: textColor,
      fontSize: DimensionHelper.wp(5.5), // Consider using theme.fonts
      fontWeight: 'bold', // Consider theme.fonts.titleMedium.fontWeight or similar
      textAlign: 'center',
      // fontFamily: theme.fonts.regular.fontFamily, // Example, adjust as needed
      // zIndex: 2,
      // Text shadow for background images
      textShadowColor: props.backgroundImage ? 'rgba(0,0,0,0.7)' : undefined,
      textShadowOffset: props.backgroundImage ? { width: 0, height: 1 } : undefined,
      textShadowRadius: props.backgroundImage ? 2 : undefined,
    },
  });

  const cardContent = (
    <View style={styles.contentContainer}>
      {props.icon && (
        <View style={styles.iconContainer}>
          {props.backgroundImage && React.isValidElement(props.icon)
            ? React.cloneElement(props.icon as React.ReactElement<any>, { color: theme.colors.surface }) // Icon color on background
            : props.icon
          }
        </View>
      )}
      <Text style={styles.text} variant="titleMedium">{props.text}</Text>
    </View>
  );

  return (
    <Card style={styles.card} onPress={props.onPress} elevation={props.backgroundImage ? 0 : 4}>
      <TouchableRipple style={styles.touchable} onPress={props.onPress} rippleColor="rgba(0, 0, 0, .32)">
        <>
          {props.backgroundImage ? (
            <ImageBackground source={props.backgroundImage} style={styles.backgroundImageStyle} imageStyle={styles.imageStyle}>
              <LinearGradient
                colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              {/* The overlay View might be redundant if LinearGradient achieves the desired effect */}
              {/* <View style={styles.overlay} /> */}
              {cardContent}
            </ImageBackground>
          ) : (
            cardContent // Render content directly if no background image
          )}
        </>
      </TouchableRipple>
    </Card>
  );
}

import { globalStyles } from "@/src/helpers"; // Keep for now, but aim to reduce usage
// Constants import removed as it's no longer used after color refactoring
import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import React from "react";
import { StyleSheet } from "react-native";
import { Card, Button, Text as PaperText, useTheme } from 'react-native-paper';

interface Props {
  title: string;
  headerIcon: React.ReactNode;
  children: React.ReactNode;
  cancelFunction?: () => void;
  deleteFunction?: () => void;
  saveFunction?: () => void;
  isSubmitting?: boolean;
}

export function InputBox({
  title,
  headerIcon,
  children,
  cancelFunction,
  deleteFunction,
  saveFunction,
  isSubmitting = false,
}: Props) {
  const theme = useTheme();
  const widthClass = deleteFunction ? DimensionHelper.wp(33.33) : DimensionHelper.wp(50);

  // Define styles locally using StyleSheet.create and theme
  const styles = StyleSheet.create({
    card: {
      // from globalStyles.paymentTitleContainer
      // Example: margin: theme.spacing(1), if theme.spacing is defined
      // For now, retain global style if it's complex or defined elsewhere for consistency
      ...globalStyles.paymentTitleContainer,
    },
    cardTitle: {
      // from globalStyles.paymentTitleText
      // fontWeight: 'bold', // Example, adjust as per globalStyles
      color: theme.colors.onSurface, // Already using theme color
      // fontSize: theme.fonts.titleMedium.fontSize, // Example
      ...globalStyles.paymentTitleText, // Spread to keep other properties
      color: theme.colors.onSurface, // Ensure theme color overrides global
    },
    cardTitleView: {
      // from globalStyles.paymentTitleView
      // borderBottomWidth: 1,
      // borderBottomColor: theme.colors.outline, // Example
      ...globalStyles.paymentTitleView, // Spread to keep other properties
    },
    cardActions: {
      // from globalStyles.previewBtnView
      flexDirection: 'row',
      justifyContent: 'space-around', // or 'flex-end', 'center' based on original
      padding: theme.spacing?.small || 8, // Example padding using theme
      ...globalStyles.previewBtnView, // Spread to keep other properties like alignItems
    },
    button: {
      // from globalStyles.actionButtons
      // height: DimensionHelper.wp(12), // Keep if necessary via DimensionHelper
      // alignItems: 'center', // Default for Button
      // justifyContent: 'center', // Default for Button
      ...commonButtonStyles, // Apply common button styles defined below
    },
    labelStyle: {
      // from globalStyles.previewBtnText
      // color: theme.colors.onPrimary, // This will be set per button based on its color
      fontSize: theme.fonts.labelLarge.fontSize,
      fontFamily: theme.fonts.labelLarge.fontFamily,
      textAlign: 'center',
    },
  });

  // Common button styles that might still use DimensionHelper or fixed values
  const commonButtonStyles = {
    height: DimensionHelper.wp(12), // Retaining from original globalStyles.actionButtons.height
    // alignItems: 'center', // Button default
    // justifyContent: 'center', // Button default
  };


  // Helper to get label color based on button background
  // This is a simplified approach. For full correctness, this might need to check theme.dark
  // and specific onTertiary, onWarning colors if defined in AppThemes.ts
  const getLabelColor = (buttonBackgroundColor: string) => {
    if (buttonBackgroundColor === theme.colors.primary ||
        buttonBackgroundColor === theme.colors.error ||
        buttonBackgroundColor === theme.colors.secondary) { // Assuming secondary might be used
      // Standard behavior for primary/error buttons often uses a light text color
      return theme.colors.surface; // Or a specific 'onPrimary', 'onError' if they guarantee contrast
    }
    // For other colors like tertiary (yellowish), a dark text might be better
    // This is a guess; ideally, theme would provide onTertiary.
    if (buttonBackgroundColor === theme.colors.tertiary) {
        return theme.colors.onTertiaryContainer; // if available, else fallback
    }
    return theme.colors.onSurface; // Fallback
  };


  const cancelLabelColor = getLabelColor(theme.colors.tertiary); // Assuming yellow maps to tertiary
  const deleteLabelColor = getLabelColor(theme.colors.error);
  const saveLabelColor = getLabelColor(theme.colors.primary);


  return (
    <Card style={styles.card}>
      <Card.Title
        title={title}
        titleStyle={styles.cardTitle}
        left={(props) => React.cloneElement(headerIcon as React.ReactElement, { size: props.size })}
        style={styles.cardTitleView}
      />
      <Card.Content>
        {children}
      </Card.Content>
      {(cancelFunction || deleteFunction || saveFunction) && (
        <Card.Actions style={styles.cardActions}>
          {cancelFunction && (
            <Button
              onPress={cancelFunction}
              disabled={isSubmitting}
              buttonColor={theme.colors.tertiary} // Replaced Constants.Colors.button_yellow
              style={[{ width: widthClass }, styles.button]}
              labelStyle={[styles.labelStyle, { color: cancelLabelColor }]}
              mode="contained"
              key="cancel"
            >
              Cancel
            </Button>
          )}
          {deleteFunction && (
            <Button
              onPress={deleteFunction}
              disabled={isSubmitting}
              buttonColor={theme.colors.error} // Replaced Constants.Colors.button_red
              style={[{ width: widthClass }, styles.button]}
              labelStyle={[styles.labelStyle, { color: deleteLabelColor }]}
              mode="contained"
              key="delete"
            >
              Delete
            </Button>
          )}
          {saveFunction && (
            <Button
              onPress={saveFunction}
              disabled={isSubmitting}
              loading={isSubmitting}
              buttonColor={theme.colors.primary} // Replaced Constants.Colors.button_dark_green
              style={[{ width: widthClass }, styles.button]}
              labelStyle={[styles.labelStyle, { color: saveLabelColor }]}
              mode="contained"
              key="save"
            >
              Save
            </Button>
          )}
        </Card.Actions>
      )}
    </Card>
  );
}

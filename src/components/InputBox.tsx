// Constants import removed as it's no longer used after color refactoring
import { DimensionHelper } from "@/src/helpers/DimensionHelper"; // Kept for widthClass
import React from "react";
import { StyleSheet } from "react-native";
import { Card, Button, useTheme } from 'react-native-paper'; // PaperText not used

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
      margin: 8,
      borderRadius: theme.roundness,
      // elevation: 1, // Default Card elevation
    },
    cardTitle: {
      // Rely on default Card.Title typography.
      // If specific color needed: color: theme.colors.onSurface
      // Default should be appropriate.
    },
    cardTitleView: {
      // If a bottom border was intended by globalStyles.paymentTitleView
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outline,
    },
    cardActions: {
      // Card.Actions default styling is usually sufficient.
      // It provides padding and space-between for items.
      // If specific justification like 'space-around' is needed:
      // justifyContent: 'space-around',
    },
    button: {
      // height is removed, let button have default height.
      // width: widthClass is applied directly in the component.
      // No commonButtonStyles needed anymore.
    },
    labelStyle: {
      // color is removed, Paper's Button in contained mode handles text color.
      fontSize: theme.fonts.labelLarge.fontSize,
      fontFamily: theme.fonts.labelLarge.fontFamily,
      textAlign: 'center',
    },
  });

  // getLabelColor function removed.
  // commonButtonStyles removed.
  // cancelLabelColor, deleteLabelColor, saveLabelColor removed.

  return (
    <Card style={styles.card} elevation={2}> {/* Added elevation explicitly for visibility */}
      <Card.Title
        title={title}
        titleStyle={styles.cardTitle} // Should rely on defaults mostly
        left={(props) => React.cloneElement(headerIcon as React.ReactElement, { size: props.size })}
        style={styles.cardTitleView} // For bottom border
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
              buttonColor={theme.colors.tertiary}
              style={[{ width: widthClass }, styles.button]} // Applying widthClass here
              labelStyle={styles.labelStyle} // Removed dynamic color
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
              buttonColor={theme.colors.error}
              style={[{ width: widthClass }, styles.button]} // Applying widthClass here
              labelStyle={styles.labelStyle} // Removed dynamic color
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
              buttonColor={theme.colors.primary}
              style={[{ width: widthClass }, styles.button]} // Applying widthClass here
              labelStyle={styles.labelStyle} // Removed dynamic color
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

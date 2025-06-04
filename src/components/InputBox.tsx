import { Constants, globalStyles } from "@/src/helpers";
import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import React from "react";
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


  const theme = useTheme(); // Though not explicitly used in this refactor, it's good practice if further themeing is needed.
  const widthClass = deleteFunction ? DimensionHelper.wp(33.33) : DimensionHelper.wp(50);

  // Extract relevant style properties for buttons, avoid passing entire globalStyles.actionButtons directly
  const commonButtonStyles = {
    height: globalStyles.actionButtons.height, // DimensionHelper.wp(12)
    alignItems: globalStyles.actionButtons.alignItems, // 'center'
    // justifyContent is part of the container (Card.Actions)
  };

  const commonLabelStyles = {
    color: globalStyles.previewBtnText.color, // 'white'
    fontSize: globalStyles.previewBtnText.fontSize, // DimensionHelper.wp(4.7)
    fontFamily: globalStyles.previewBtnText.fontFamily, // Constants.Fonts.RobotoMedium
    textAlign: globalStyles.previewBtnText.textAlign, // 'center'
    // width prop from previewBtnText is omitted as Button handles text layout
  };

  return (
    <Card style={globalStyles.paymentTitleContainer}>
      <Card.Title
        title={title}
        titleStyle={[globalStyles.paymentTitleText, { color: theme.colors.onSurface }]} // Adjust color if needed, or remove to use theme default
        left={(props) => React.cloneElement(headerIcon as React.ReactElement, { size: props.size })}
        style={globalStyles.paymentTitleView} // Apply relevant parts of paymentTitleView, like borderBottom if necessary
      />
      <Card.Content>
        {children}
      </Card.Content>
      {(cancelFunction || deleteFunction || saveFunction) && (
        <Card.Actions style={globalStyles.previewBtnView}>
          {cancelFunction && (
            <Button
              onPress={cancelFunction}
              disabled={isSubmitting}
              buttonColor={Constants.Colors.button_yellow}
              style={[{ width: widthClass }, commonButtonStyles]}
              labelStyle={commonLabelStyles}
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
              buttonColor={Constants.Colors.button_red}
              style={[{ width: widthClass }, commonButtonStyles]}
              labelStyle={commonLabelStyles}
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
              buttonColor={Constants.Colors.button_dark_green}
              style={[{ width: widthClass }, commonButtonStyles]}
              labelStyle={commonLabelStyles}
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

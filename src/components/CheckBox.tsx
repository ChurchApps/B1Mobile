import React from "react";
import { Checkbox, useTheme } from 'react-native-paper';
import { StyleSheet, View } from "react-native"; // Keep StyleSheet for potential custom container styling

interface Props {
  isChecked: boolean;
  title: string;
  onPress: () => void;
  disabled?: boolean; // Added disabled prop for completeness with Checkbox.Item
  // Add any other specific styling props if needed, e.g., for the container
  style?: object;
}

const PaperCheckBox = (props: Props) => { // Renamed to avoid conflict if CheckBox is imported elsewhere
  const theme = useTheme();

  // Checkbox.Item handles the layout of the checkbox and the label.
  // It also handles the press event on the entire item.
  return (
    <View style={[styles.container, props.style]}>
      <Checkbox.Item
        label={props.title}
        status={props.isChecked ? 'checked' : 'unchecked'}
        onPress={props.onPress}
        disabled={props.disabled}
        // color={theme.colors.primary} // Checkbox color, applied when checked
        // uncheckedColor={theme.colors.onSurfaceDisabled} // Color when unchecked
        // labelStyle={{ color: theme.colors.onSurface }} // Customize label style if needed
        // mode="android" // or "ios", influences appearance and ripple effect
        style={styles.checkboxItem} // Style for the Checkbox.Item itself if needed
      />
    </View>
  );
};

export default PaperCheckBox;

const styles = StyleSheet.create({
  container: {
    // The original container had:
    // justifyContent: "flex-start", // Checkbox.Item is typically full width or self-width
    // alignItems: "center", // Handled by Checkbox.Item
    // flexDirection: "row", // Handled by Checkbox.Item
    // width: 150, // This might be undesirable for a generic component. Remove or make prop.
    // marginTop: 5, // Pass as style prop if needed
    // marginHorizontal: 5, // Pass as style prop if needed
    // Default Checkbox.Item might have its own padding/margin.
    // If a fixed width is truly needed, it can be applied via props.style to the container View.
  },
  checkboxItem: {
    // If you need to override Checkbox.Item's default padding, for example:
    // paddingHorizontal: 0,
    // paddingVertical: 0, // Example to make it more compact
  }
  // Original title style is now handled by Checkbox.Item's labelStyle or default theming
  // title: {
  //   fontSize: 16,
  //   color: "#000", // Will use theme.colors.onSurface or similar
  //   marginLeft: 5, // Handled by Checkbox.Item's internal layout
  // },
});

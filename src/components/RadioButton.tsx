import React from 'react';
import { View } from 'react-native'; // View might still be used for overall layout if needed
import { RadioButton, Text, useTheme } from 'react-native-paper'; // Text might be used if labels need custom styling outside RadioButton.Item

// The individual RadioButton function is effectively replaced by RadioButton.Item

interface PaperRadioButtonGroupProps {
  options: Array<{ label: string; value: string }>; // Combine options and values
  selectedValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean; // Optional disabled state for the whole group
  // style?: object; // Optional styles for the group container
}

export function RadioButtonGroup(props: PaperRadioButtonGroupProps) {
  const theme = useTheme();
  const { options, selectedValue, onValueChange, disabled } = props;

  return (
    <RadioButton.Group onValueChange={onValueChange} value={selectedValue}>
      {options.map((option) => (
        <RadioButton.Item
          key={option.value}
          label={option.label}
          value={option.value}
          disabled={disabled} // Apply disabled state to each item
          // status={selectedValue === option.value ? 'checked' : 'unchecked'} // Handled by RadioButton.Group
          // onPress={() => onValueChange(option.value)} // Handled by RadioButton.Group
          // color={theme.colors.primary} // Color of the radio button when selected
          // uncheckedColor={theme.colors.onSurfaceDisabled} // Color when unchecked
          // labelStyle={{ color: theme.colors.onSurface }} // Custom label style
          // style={{ marginVertical: 2 }} // Custom style for each RadioButton.Item container
        />
      ))}
    </RadioButton.Group>
  );
}

// Original styles are mostly replaced by RadioButton.Item and RadioButton.Group defaults.
// If specific layout like `singleOptionContainer` or circle styles are strictly needed
// beyond what Paper components offer, deeper customization or different components might be required.
// For this refactor, we assume Paper's defaults are acceptable.
// const styles = StyleSheet.create({
//   singleOptionContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     columnGap: 10,
//     margin: 5,
//   },
//   outerCircle: {
//     // ...
//   },
//   innerCircle: {
//     // ...
//   },
// });

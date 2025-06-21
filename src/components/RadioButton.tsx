import { DimensionHelper } from "@/helpers/DimensionHelper";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface RadioButtonProps {
  label: string;
  value: string;
  selectedValue: string;
  onSelect: (value: string) => void;
}

function RadioButton({ label, value, selectedValue, onSelect }: RadioButtonProps) {
  return (
    <TouchableOpacity style={styles.singleOptionContainer} onPress={() => onSelect(value)}>
      <View style={styles.outerCircle}>{selectedValue === value ? <View style={styles.innerCircle} /> : null}</View>
      <Text style={{ fontSize: DimensionHelper.wp(3.5) }}>{label}</Text>
    </TouchableOpacity>
  );
}

interface RadioButtonGroupProps {
  options: string[]; // Display labels
  values: string[]; // Actual values
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export function RadioButtonGroup({ options, values, selectedValue, onValueChange }: RadioButtonGroupProps) {
  return (
    <View>
      {options.map((option, index) => (
        <RadioButton key={`radio-${option.toLowerCase().replace(/\s+/g, "-")}-${values[index]}`} label={option} value={values[index]} selectedValue={selectedValue} onSelect={onValueChange} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  singleOptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
    margin: 5
  },
  outerCircle: {
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    borderWidth: 2,
    borderColor: "rgb(25, 118, 210)",
    justifyContent: "center",
    alignItems: "center"
  },
  innerCircle: {
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: "rgb(25, 118, 210)]"
  }
});

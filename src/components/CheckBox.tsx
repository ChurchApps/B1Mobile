import { DimensionHelper } from "@/helpers/DimensionHelper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../theme";

interface Props {
  isChecked: boolean;
  title: string;
  onPress: () => void;
}

const CheckBox = (props: Props) => {
  const colors = useThemeColors();
  const iconName = props.isChecked ? "checkbox-marked" : "checkbox-blank-outline";

  return (
    <View style={styles.container}>
      <Pressable onPress={props.onPress}>
        <MaterialCommunityIcons name={iconName} size={DimensionHelper.wp(8)} color={colors.primary} />
      </Pressable>
      <Text style={[styles.title, { color: colors.text }]}>{props.title}</Text>
    </View>
  );
};

export default CheckBox;

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    width: 150,
    marginTop: 5,
    marginHorizontal: 5
  },
  title: {
    fontSize: 16,
    marginLeft: 5
  }
});

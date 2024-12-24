import { DimensionHelper } from "@churchapps/mobilehelper";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Constants } from "../helpers";

interface Props {
  isChecked: boolean;
  title: string;
  onPress: () => void;
}

const CheckBox = (props: Props) => {
  const iconName = props.isChecked ? "checkbox-marked" : "checkbox-blank-outline";

  return (
    <View style={styles.container}>
      <Pressable onPress={props.onPress}>
        <MaterialCommunityIcons name={iconName} size={DimensionHelper.wp('8%')} color={Constants.Colors.app_color} />
      </Pressable>
      <Text style={styles.title}>{props.title}</Text>
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
    marginHorizontal: 5,
  },
  title: {
    fontSize: 16,
    color: "#000",
    marginLeft: 5,
    // fontWeight: "600",
  },
});
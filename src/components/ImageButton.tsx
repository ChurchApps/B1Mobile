import * as React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DimensionHelper } from "@/src/helpers/DimensionHelper";

interface Props {
  icon: React.ReactNode,
  text: string,
  onPress: () => void
}

export function ImageButton(props: Props) {
  const styles = StyleSheet.create({
    btn: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: DimensionHelper.wp(2),
      marginHorizontal: DimensionHelper.wp(2),
      backgroundColor: 'transparent',
      width: DimensionHelper.wp(38),
      height: DimensionHelper.wp(32),
      borderRadius: DimensionHelper.wp(3),
    },
    icon: {
      marginBottom: DimensionHelper.wp(2),
    },
    text: {
      color: '#222',
      fontSize: DimensionHelper.wp(4.5),
      fontWeight: '600',
      textAlign: 'center',
      marginTop: DimensionHelper.wp(1),
    },
  });

  return (
    <TouchableOpacity style={styles.btn} onPress={props.onPress}>
      <View style={styles.icon}>{props.icon}</View>
      <Text style={styles.text}>{props.text}</Text>
    </TouchableOpacity>
  );
}

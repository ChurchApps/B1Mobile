import { DimensionHelper } from "@churchapps/mobilehelper";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  image: ImageSourcePropType,
  text: string,
  onPress: () => void
}

export function ImageButton(props: Props) {

  const styles = StyleSheet.create({
    absoluteView: {
      width: "100%",
      height: DimensionHelper.wp(25),
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent'
    },
    img: { width: "100%", height: "100%", opacity: 0.6 },
    btn: { width: "100%", height: DimensionHelper.wp(25), marginBottom: 5, marginTop: 5, backgroundColor: "#000000" }
  });

  return (<TouchableOpacity style={styles.btn} onPress={props.onPress} >
    <Image source={props.image} style={styles.img} />
    <View style={styles.absoluteView}>
      <Text style={{ color: "#FFFFFF", fontSize: DimensionHelper.wp(10) }}>{props.text}</Text>
    </View>
  </TouchableOpacity>);
}

import * as React from "react";
import { StyleSheet, Text, Pressable, View, Animated } from "react-native";
import { DimensionHelper } from "@/src/helpers/DimensionHelper";

interface Props {
  icon: React.ReactNode,
  text: string,
  onPress: () => void,
  color?: string,
}

export function ImageButton(props: Props) {
  const [pressed, setPressed] = React.useState(false);
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const styles = StyleSheet.create({
    btn: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: DimensionHelper.wp(2),
      marginHorizontal: DimensionHelper.wp(2),
      backgroundColor: pressed ? '#f0f4fa' : 'white',
      width: DimensionHelper.wp(38),
      height: DimensionHelper.wp(32),
      borderRadius: DimensionHelper.wp(3),
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    icon: {
      marginBottom: DimensionHelper.wp(2),
    },
    text: {
      color: props.color || '#175ec1',
      fontSize: DimensionHelper.wp(4.5),
      fontWeight: '700',
      textAlign: 'center',
      marginTop: DimensionHelper.wp(1),
      fontFamily: 'System',
    },
  });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={styles.btn}
        onPress={props.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.icon}>{props.icon}</View>
        <Text style={styles.text}>{props.text}</Text>
      </Pressable>
    </Animated.View>
  );
}

import * as React from "react";
import { StyleSheet, Text, Pressable, View, Animated, Image, ImageSourcePropType } from "react-native";
import { DimensionHelper } from "@/src/helpers/DimensionHelper";

interface Props {
  icon: React.ReactNode,
  text: string,
  onPress: () => void,
  color?: string,
  backgroundImage?: ImageSourcePropType,
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
      marginHorizontal: 0,
      backgroundColor: pressed ? '#f0f4fa' : 'white',
      width: DimensionHelper.wp(38),
      height: DimensionHelper.wp(32),
      borderRadius: DimensionHelper.wp(4.5),
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    backgroundImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    icon: {
      marginBottom: DimensionHelper.wp(2),
      zIndex: 2,
    },
    text: {
      color: props.backgroundImage ? '#fff' : (props.color || '#175ec1'),
      fontSize: DimensionHelper.wp(5.5),
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: props.icon ? DimensionHelper.wp(1) : 0,
      marginBottom: props.icon ? 0 : DimensionHelper.wp(1),
      fontFamily: 'System',
      zIndex: 2,
      textShadowColor: props.backgroundImage ? 'rgba(0,0,0,0.7)' : 'transparent',
      textShadowOffset: props.backgroundImage ? { width: 0, height: 1 } : undefined,
      textShadowRadius: props.backgroundImage ? 2 : undefined,
    },
    content: {
      alignItems: 'center',
      justifyContent: props.icon ? 'center' : 'center',
      width: '100%',
      height: '100%',
      zIndex: 2,
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
        {props.backgroundImage && (
          <Image source={props.backgroundImage} style={styles.backgroundImage} />
        )}
        {props.backgroundImage && <View style={styles.overlay} />}
        <View style={styles.content}>
          <View style={styles.icon}>
            {props.backgroundImage && React.isValidElement(props.icon)
              ? React.cloneElement(props.icon as React.ReactElement<any>, { color: '#fff' })
              : props.icon
            }
          </View>
          <Text style={styles.text}>{props.text}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

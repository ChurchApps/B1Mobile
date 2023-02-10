import React from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

interface Props {
  isVisible: boolean;
  close: () => void;
  children: React.ReactNode;
  width?: number;
  height?: number;
}

export function CustomModal({ isVisible, close, children, width, height }: Props) {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => close()}
      backdropOpacity={0.5}
      useNativeDriverForBackdrop={true}
      animationIn="zoomIn"
      animationOut="zoomOut"
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
      >
        <View style={{ backgroundColor: "#fff", padding: wp("3%"), borderRadius: 8, height, width }}>{children}</View>
      </View>
    </Modal>
  );
}

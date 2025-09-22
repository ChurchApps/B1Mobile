import { DimensionHelper } from "@/helpers/DimensionHelper";
import React from "react";
import { ScrollView, View } from "react-native";
import Modal from "react-native-modal";

interface Props {
  isVisible: boolean;
  close: () => void;
  children: React.ReactNode;
  width?: number;
  height?: number;
}

export function EventModal({ isVisible, close, children, width, height }: Props) {
  return (
    <Modal isVisible={isVisible} onBackdropPress={() => close()} backdropOpacity={0.5} useNativeDriverForBackdrop={true} animationIn="zoomIn" animationOut="zoomOut" propagateSwipe={true}>
      <View style={{ maxHeight: "70%" }}>
        <View style={{ backgroundColor: "#fff", padding: DimensionHelper.wp(3), borderRadius: 8, height, width }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

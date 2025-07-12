import { DimensionHelper } from "@/helpers/DimensionHelper";
import * as React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Constants, globalStyles } from "../../../src/helpers";
import { StripePaymentMethod } from "../../../src/interfaces";
import { CustomModal } from "./CustomModal";

interface Props {
  show: boolean;
  close: () => void;
  onSelect: (paymentMethod: StripePaymentMethod) => void;
}

export function PaymentMethodModal({ show, close, onSelect }: Props) {
  const methods: string[] = ["card", "bank"];

  return (
    <CustomModal isVisible={show} close={close} width={DimensionHelper.wp(48.5)}>
      <FlatList
        data={methods}
        style={{ marginVertical: DimensionHelper.wp(-2) }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => {
              onSelect(new StripePaymentMethod({ type: item }));
              close();
            }}
            style={{ flexDirection: "row", alignItems: "center" }}>
            {index == 0 ? (
              <MaterialIcons name="credit-card" style={{ color: Constants.Colors.button_green, marginHorizontal: DimensionHelper.wp(4) }} size={DimensionHelper.wp(6)} />
            ) : (
              <MaterialCommunityIcons name="bank" style={{ color: Constants.Colors.button_green, marginHorizontal: DimensionHelper.wp(4) }} size={DimensionHelper.wp(6)} />
            )}
            <Text
              style={{
                fontSize: DimensionHelper.wp(4.8),
                fontFamily: Constants.Fonts.RobotoRegular,
                textAlign: "center",
                paddingVertical: DimensionHelper.wp(2)
              }}>
              Add {item[0].toUpperCase() + item.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item: any) => item}
        ItemSeparatorComponent={() => <View style={globalStyles.cardListSeperator} />}
      />
    </CustomModal>
  );
}

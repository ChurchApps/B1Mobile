import  React from "react";
import { TouchableOpacity, FlatList, Text, View } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/FontAwesome";
import { globalStyles, Constants } from "../../helpers";
import { StripePaymentMethod } from "../../interfaces";
import { CustomModal } from "./CustomModal";

interface Props {
  show: boolean;
  close: () => void;
  onSelect: (paymentMethod: StripePaymentMethod) => void;
}

export function PaymentMethodModal({ show, close, onSelect }: Props) {
  const methods: string[] = ["card", "bank"];

  return (
    <CustomModal isVisible={show} close={close} width={wp(48.5)}>
      <FlatList
        data={methods}
        style={{ marginVertical: wp("-2%") }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => {
              onSelect(new StripePaymentMethod({ type: item }));
              close();
            }}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Icon
              name={index == 0 ? "credit-card-alt" : "bank"}
              style={{ color: Constants.Colors.button_green, marginHorizontal: wp("4%") }}
              size={wp("6%")}
            />
            <Text
              style={{
                fontSize: wp("4.8%"),
                fontFamily: Constants.Fonts.RobotoRegular,
                textAlign: "center",
                paddingVertical: wp("2%"),
              }}
            >
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

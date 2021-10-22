import * as React from "react";
import { TouchableOpacity, FlatList, Text, View } from "react-native";
import Dialog, { DialogContent, ScaleAnimation } from "react-native-popup-dialog";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/FontAwesome";
import Fonts from "../../utils/Fonts";
import globalStyles from "../../helper/GlobalStyles";
import Colors from "../../utils/Colors";

interface Props {
  show: boolean;
  close: () => void;
  onSelect: (methodType: Methods) => void;
}

type Methods = "Add Card" | "Add Bank"

export function SelectPaymentMethod({ show, close, onSelect }: Props) {
  const methods: Methods[] = ["Add Card", "Add Bank"];

  return (
    <Dialog onTouchOutside={close} width={0.5} visible={show} dialogAnimation={new ScaleAnimation()}>
      <DialogContent>
        <FlatList
          data={methods}
          style={{ marginTop: wp("1%"), marginBottom: wp("-5%") }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item);
                close();
              }}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Icon
                name={index == 0 ? "credit-card-alt" : "bank"}
                style={{ color: Colors.button_green, marginHorizontal: wp("4%") }}
                size={wp("6%")}
              />
              <Text
                style={{
                  fontSize: wp("4.8%"),
                  fontFamily: Fonts.RobotoRegular,
                  textAlign: "center",
                  paddingVertical: wp("2%"),
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item: any) => item}
          ItemSeparatorComponent={() => <View style={globalStyles.cardListSeperator} />}
        />
      </DialogContent>
    </Dialog>
  );
}

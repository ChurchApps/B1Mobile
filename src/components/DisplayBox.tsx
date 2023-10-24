import * as React from "react";
import { View, Text,Dimensions,PixelRatio } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { globalStyles } from "../helpers";

interface Props {
  title: string;
  rightHeaderComponent?: React.ReactNode;
  headerIcon: React.ReactNode;
  children: React.ReactNode;
}

export function DisplayBox({ title, rightHeaderComponent, headerIcon, children }: Props) {
  const [dimension, setDimension] = React.useState(Dimensions.get("screen"));

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
  };

  React.useEffect(()=>{
    Dimensions.addEventListener("change", () => {
      const dim = Dimensions.get("screen")
      setDimension(dim);
    })
  },[dimension])

  return (
    <View style={[globalStyles.paymentTitleContainer,{width:wd("100%")}]}>
      <View style={{ width: wd("100%") }}>
        <View style={[globalStyles.paymentTitleHeaderLine,{width:wd("100%")}]} />
        <View style={[globalStyles.paymentTitleView,{paddingHorizontal:wd("4%")}]}>
          {headerIcon}
          <Text style={globalStyles.paymentTitleText}>{title}</Text>
          {rightHeaderComponent || <View style={{ width: wd("6%") }} />}
        </View>
      </View>
      {children}
    </View>
  );
}

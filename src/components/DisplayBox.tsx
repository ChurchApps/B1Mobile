import * as React from "react";
import { View, Text } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { globalStyles } from "../helper";

interface Props {
  title: string;
  rightHeaderComponent?: React.ReactNode;
  headerIcon: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function DisplayBox({ title, rightHeaderComponent, headerIcon, children, footer }: Props) {
  return (
    <View style={globalStyles.paymentTitleContainer}>
      <View style={{ width: wp("100%") }}>
        <View style={globalStyles.paymentTitleHeaderLine} />
        <View style={globalStyles.paymentTitleView}>
          {headerIcon}
          <Text style={globalStyles.paymentTitleText}>{title}</Text>
          {rightHeaderComponent || <View style={{ width: wp("6%") }} />}
        </View>
      </View>
      {children}
      {footer}
    </View>
  );
}

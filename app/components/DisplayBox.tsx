import { DimensionHelper } from "@churchapps/mobilehelper";
import * as React from "react";
import { Text, View } from "react-native";
import { globalStyles } from "@/src/helpers";

interface Props {
  title: string;
  rightHeaderComponent?: React.ReactNode;
  headerIcon: React.ReactNode;
  children: React.ReactNode;
}

export function DisplayBox({ title, rightHeaderComponent, headerIcon, children }: Props) {

  return (
    <View style={[globalStyles.paymentTitleContainer,{width:DimensionHelper.wp('100%')}]}>
      <View style={{ width: DimensionHelper.wp("100%") }}>
        <View style={[globalStyles.paymentTitleHeaderLine,{width:DimensionHelper.wp('100%')}]} />
        <View style={[globalStyles.paymentTitleView,{paddingHorizontal:DimensionHelper.wp('4%')}]}>
          {headerIcon}
          <Text style={globalStyles.paymentTitleText}>{title}</Text>
          {rightHeaderComponent || <View style={{ width: DimensionHelper.wp("6%") }} />}
        </View>
      </View>
      {children}
    </View>
  );
}

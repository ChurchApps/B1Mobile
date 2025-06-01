import { globalStyles } from "@/src/helpers";
import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import React from 'react';
import { Text, View, StyleSheet } from "react-native";

interface Props {
  title: string;
  rightHeaderComponent?: React.ReactNode;
  headerIcon: React.ReactNode;
  children: React.ReactNode;
}

const styles = StyleSheet.create({
  container: {
    width: DimensionHelper.wp(100),
    backgroundColor: 'white',
    borderRadius: DimensionHelper.wp(2),
    marginTop: DimensionHelper.wp(2),
    padding: DimensionHelper.wp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: DimensionHelper.wp(1),
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DimensionHelper.wp(2),
  },
  titleText: {
    fontSize: DimensionHelper.wp(4),
    fontWeight: 'bold',
  }
});

export function DisplayBox({ title, rightHeaderComponent, headerIcon, children }: Props) {

  return (
    <View style={[globalStyles.paymentTitleContainer, { width: DimensionHelper.wp(100) }]}>
      <View style={{ width: DimensionHelper.wp(100) }}>
        <View style={[globalStyles.paymentTitleHeaderLine, { width: DimensionHelper.wp(100) }]} />
        <View style={[globalStyles.paymentTitleView, { paddingHorizontal: DimensionHelper.wp(4) }]}>
          {headerIcon}
          <Text style={globalStyles.paymentTitleText}>{title}</Text>
          {rightHeaderComponent || <View style={{ width: DimensionHelper.wp(6) }} />}
        </View>
      </View>
      {children}
    </View>
  );
}

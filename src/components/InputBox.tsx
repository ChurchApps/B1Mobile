import { DimensionHelper } from "@churchapps/mobilehelper";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Constants, globalStyles } from "../helpers";

interface Props {
  title: string;
  headerIcon: React.ReactNode;
  children: React.ReactNode;
  cancelFunction?: () => void;
  deleteFunction?: () => void;
  saveFunction?: () => void;
  isSubmitting?: boolean;
}

export function InputBox({
  title,
  headerIcon,
  children,
  cancelFunction,
  deleteFunction,
  saveFunction,
  isSubmitting = false,
}: Props) {


  let buttons: JSX.Element[] = [];

  const widthClass = deleteFunction ? DimensionHelper.wp("33.33%") : DimensionHelper.wp("50%");
  if (cancelFunction) {
    buttons.push(
      <TouchableOpacity
        style={{ ...globalStyles.actionButtons, backgroundColor: Constants.Colors.button_yellow, width: widthClass }}
        onPress={() => {
          cancelFunction();
        }}
        disabled={isSubmitting}
        key="cancel"
      >
        <Text style={globalStyles.previewBtnText}>Cancel</Text>
      </TouchableOpacity>
    );
  }
  if (deleteFunction) {
    buttons.push(
      <TouchableOpacity
        style={{ ...globalStyles.actionButtons, backgroundColor: Constants.Colors.button_red, width: widthClass }}
        onPress={() => {
          deleteFunction();
        }}
        disabled={isSubmitting}
      >
        <Text style={globalStyles.previewBtnText}>Delete</Text>
      </TouchableOpacity>
    );
  }
  if (saveFunction) {
    buttons.push(
      <TouchableOpacity
        style={{ ...globalStyles.actionButtons, backgroundColor: Constants.Colors.button_dark_green, width: widthClass }}
        onPress={() => saveFunction()}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="gray" animating={isSubmitting} />
        ) : (
          <Text style={globalStyles.previewBtnText}>Save</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={globalStyles.paymentTitleContainer}>
      <View style={{ width: DimensionHelper.wp("100%") }}>
        <View style={globalStyles.paymentTitleHeaderLine} />
        <View style={globalStyles.paymentTitleView}>
          {headerIcon}
          <Text style={globalStyles.paymentTitleText}>{title}</Text>
          <View style={{ width: DimensionHelper.wp("6%") }} />
        </View>
      </View>
      {children}
      <View style={{ ...globalStyles.previewBtnView }}>{buttons}</View>
    </View>
  );
}

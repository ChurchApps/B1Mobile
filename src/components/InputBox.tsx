import React,{useState,useEffect} from "react";
import { View, Text, TouchableOpacity, ActivityIndicator ,Dimensions,PixelRatio} from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
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

  const [dimension, setDimension] = useState(Dimensions.get('screen'));

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
  };
  useEffect(()=>{
    Dimensions.addEventListener('change', () => {
      const dim = Dimensions.get('screen')
      setDimension(dim);
    })
  },[dimension])

  let buttons: JSX.Element[] = [];

  const widthClass = deleteFunction ? wp("33.33%") : wp("50%");
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
      <View style={{ width: wd("100%") }}>
        <View style={globalStyles.paymentTitleHeaderLine} />
        <View style={globalStyles.paymentTitleView}>
          {headerIcon}
          <Text style={globalStyles.paymentTitleText}>{title}</Text>
          <View style={{ width: wp("6%") }} />
        </View>
      </View>
      {children}
      <View style={{ ...globalStyles.previewBtnView }}>{buttons}</View>
    </View>
  );
}

import * as React from "react";
import { ActivityIndicator } from "react-native";
import { globalStyles } from "../helper";

interface Props {
  isLoading: any;
}

export function Loader({ isLoading }: Props) {
  return <ActivityIndicator style={globalStyles.indicatorStyle} size="large" color="gray" animating={isLoading} />;
}

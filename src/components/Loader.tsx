import { globalStyles } from "@/src/helpers";
import React from 'react';
import { ActivityIndicator } from 'react-native';

interface Props {
  isLoading: any;
}

export function Loader({ isLoading }: Props) {
  return <ActivityIndicator style={globalStyles.indicatorStyle} size="large" color="gray" animating={isLoading} />;
}

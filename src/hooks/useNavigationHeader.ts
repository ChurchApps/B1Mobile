import { useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

type HeaderConfig = {
  title?: string;
  placeholder?: string;
  headerRight?: () => void;
  dependencies?: any[]; // additional dependencies
};

export function useScreenHeader({ title, placeholder, headerRight, dependencies = [] }: HeaderConfig) {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: title || placeholder || "Screen",
        headerRight
      });
    }, [navigation, title, placeholder, headerRight, ...dependencies])
  );
}

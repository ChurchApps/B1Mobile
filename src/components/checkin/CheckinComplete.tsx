import { UserHelper } from "../../../src/helpers";
import React, { useEffect } from "react";
import { View } from "react-native";
import { useAppTheme } from "../../../src/theme";
import { IconButton, Surface, Text } from "react-native-paper";

interface Props {
  onDone: () => void;
}

export const CheckinComplete = (props: Props) => {
  const { theme, spacing } = useAppTheme();

  useEffect(() => {
    UserHelper.addOpenScreenEvent("CheckinCompleteScreen");
    setTimeout(() => {
      props.onDone();
    }, 1500);
  }, []);

  return (
    <Surface style={{ flex: 1, backgroundColor: "white", justifyContent: "center", alignItems: "center", elevation: 2 }}>
      <View style={{ alignItems: "center" }}>
        <IconButton icon="check-circle" size={80} iconColor="green" />
        <Text variant="headlineMedium" style={{ marginTop: spacing.md, color: theme.colors.onSurface }}>
          Check-in Complete!
        </Text>
      </View>
    </Surface>
  );
};

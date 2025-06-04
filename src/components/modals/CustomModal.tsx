import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import React from "react";
import { Modal as PaperModal, Portal, useTheme } from 'react-native-paper';
import { StyleSheet } from "react-native";

interface Props {
  isVisible: boolean;
  close: () => void;
  children: React.ReactNode;
  width?: number | string; // Allow string for percentages e.g. "80%"
  height?: number | string;
  // Add other styling props for contentContainerStyle if needed
  contentStyle?: object;
}

export function CustomModal({ isVisible, close, children, width, height, contentStyle }: Props) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    contentContainer: {
      backgroundColor: theme.colors.surface, // Use theme surface color
      padding: DimensionHelper.wp(3),       // Keep original padding for now
      borderRadius: theme.roundness * 2,    // Use theme roundness (8 is often roundness * 2)
      alignSelf: 'center', // Center the modal content on screen
      width: width || 'auto', // Default to auto width if not specified
      height: height || 'auto', // Default to auto height if not specified
      // Max width/height can be added if needed, e.g., maxWidth: '90%'
    },
  });

  return (
    <Portal>
      <PaperModal
        visible={isVisible}
        onDismiss={close}
        contentContainerStyle={[styles.contentContainer, contentStyle]} // Apply combined styles
        // Paper.Modal default animation is fade and scale.
        // The backdrop is semi-transparent by default.
      >
        {children}
      </PaperModal>
    </Portal>
  );
}

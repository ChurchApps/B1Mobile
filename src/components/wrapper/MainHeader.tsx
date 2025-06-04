import { DimensionHelper } from '@/src/helpers/DimensionHelper'; // Kept for custom sizing if necessary
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
// Constants and globalStyles are aimed to be removed or replaced by theme.

interface Props {
  title: string;
  back?: () => void;
  openDrawer?: () => void;
  hideBell?: boolean;
  onToggleNotifications?: () => void;
}

export function MainHeader(props: Props) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    header: {
      backgroundColor: theme.colors.primary,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      // Example: using theme fonts. Adjust specific font (e.g., titleLarge, titleMedium) as needed.
      // fontSize: theme.fonts.titleLarge.fontSize,
      // fontWeight: theme.fonts.titleLarge.fontWeight as any, // Type assertion if needed
      fontFamily: theme.fonts.titleLarge.fontFamily, // Ensure this font is loaded
      color: theme.colors.onPrimary,
    },
    appbarContent: {
      // Default behavior of Appbar.Content is to take up flexible space.
      // To truly center the title when actions are present on one or both sides,
      // you might need to ensure it has enough flexGrow and actions have fixed/min width.
      // The `alignItems: 'center'` here might not globally center the text if flex distribution is uneven.
      // It centers the title *within* the Appbar.Content allocated space.
      // For more robust centering, one might pass a custom styled Text component to the title prop.
      alignItems: 'center', // Keep if this visual centering is acceptable
    },
    actionSpacer: {
      width: DimensionHelper.wp(6), // Retain specific spacer width for layout consistency
      opacity: 0,
    }
  });

  // Define icon sizes - consider using default Paper sizes or making these theme-configurable
  const backIconSize = Platform.OS === 'ios' ? DimensionHelper.hp(3.5) : DimensionHelper.wp(6); // Example
  const menuIconSize = DimensionHelper.wp(6);
  const bellIconSize = DimensionHelper.wp(6);


  return (
    <Appbar.Header style={styles.header}>
      {/* Left Actions */}
      {Platform.OS === 'ios' && props.back ? (
        <Appbar.BackAction onPress={props.back} color={theme.colors.onPrimary} size={backIconSize} />
      ) : props.openDrawer ? (
        <Appbar.Action icon="menu" onPress={props.openDrawer} color={theme.colors.onPrimary} size={menuIconSize} />
      ) : (
        <Appbar.Action icon="menu" style={styles.actionSpacer} disabled /> // Use a visible icon for spacer to maintain width if icon name matters for layout
      )}

      {/* Title */}
      <Appbar.Content
        title={props.title}
        titleStyle={styles.title}
        style={styles.appbarContent}
      />

      {/* Right Actions */}
      {!props.hideBell && props.onToggleNotifications ? (
        <Appbar.Action icon="bell-outline" onPress={props.onToggleNotifications} color={theme.colors.onPrimary} size={bellIconSize} />
      ) : (
        <Appbar.Action icon="bell-outline" style={styles.actionSpacer} disabled /> // Use a visible icon for spacer
      )}
    </Appbar.Header>
  );
}

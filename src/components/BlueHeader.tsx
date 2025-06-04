import { Constants, globalStyles } from '@/src/helpers'; // Constants likely needed for Images.logoWhite
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { router } from 'expo-router';
import { Image, View, StyleSheet } from 'react-native'; // View is needed for spacers
import { Appbar, useTheme } from 'react-native-paper';

interface Props {
  navigation?: {
    navigate: (screenName: string, params?: any) => void;
    openDrawer?: () => void;
  };
  showBack: boolean;
  showMenu: boolean;
}

const SPACER_WIDTH = DimensionHelper.wp(10); // Approx width of an Appbar.Action, adjust as needed

export function BlueHeader(props: Props) {
  const theme = useTheme();
  const { showBack, showMenu, navigation } = props;

  // Adjusted logo style for flex layout
  const logoStyle = {
    ...globalStyles.blueMainIcon, // Spread to keep potential base styles
    flex: 1,
    resizeMode: 'contain' as 'contain',
    margin: 0,
    alignSelf: undefined, // Let flexbox handle alignment (overrides any alignSelf from globalStyles)
    width: DimensionHelper.wp(55), // Keep original width constraint
    height: DimensionHelper.wp(55), // Keep original height constraint
  };

  const styles = StyleSheet.create({
    appbarHeader: {
      backgroundColor: theme.colors.primary, // Use theme color
      borderBottomLeftRadius: DimensionHelper.wp(8), // Consider theme.roundness or keep specific
      borderBottomRightRadius: DimensionHelper.wp(8),// Consider theme.roundness or keep specific
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    spacer: {
      width: SPACER_WIDTH,
    },
    // logoStyle is defined inline as it uses globalStyles spread
  });

  return (
    <Appbar.Header style={styles.appbarHeader}>
      {showBack ? (
        <Appbar.BackAction
          onPress={() => router.back()}
          color={theme.colors.onPrimary} // Use theme color
          size={DimensionHelper.wp(6)} // Consider default size or make theme-dependent
        />
      ) : (
        <View style={styles.spacer} />
      )}

      {/* Ensure Constants.Images.logoWhite is valid; this was from the original code */}
      <Image source={Constants.Images.logoWhite} style={logoStyle} />

      {showMenu && navigation?.openDrawer ? (
        <Appbar.Action
          icon="menu"
          onPress={navigation.openDrawer}
          color={theme.colors.onPrimary} // Use theme color
          size={DimensionHelper.wp(6)} // Consider default size or make theme-dependent
        />
      ) : (
        <View style={styles.spacer} />
      )}
    </Appbar.Header>
  );
}

BlueHeader.defaultProps = {
  showBack: false,
  showMenu: false,
};

import { Constants } from '@/src/helpers'; // Constants likely needed for Images.logoWhite
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

const SPACER_WIDTH = 48; // Standard touch target size

export function BlueHeader(props: Props) {
  const theme = useTheme();
  const { showBack, showMenu, navigation } = props;

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
    logo: {
      flex: 1,
      resizeMode: 'contain',
      margin: 0,
      alignSelf: 'center',
      width: DimensionHelper.wp(55), // Keep this specific dimension
      height: DimensionHelper.wp(55), // Keep this specific dimension
    }
  });

  return (
    <Appbar.Header style={styles.appbarHeader}>
      {showBack ? (
        <Appbar.BackAction
          onPress={() => router.back()}
          color={theme.colors.onPrimary} // Use theme color
          // size prop removed to use default
        />
      ) : (
        <View style={styles.spacer} />
      )}

      {/* Ensure Constants.Images.logoWhite is valid; this was from the original code */}
      <Image source={Constants.Images.logoWhite} style={styles.logo} />

      {showMenu && navigation?.openDrawer ? (
        <Appbar.Action
          icon="menu"
          onPress={navigation.openDrawer}
          color={theme.colors.onPrimary} // Use theme color
          // size prop removed to use default
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

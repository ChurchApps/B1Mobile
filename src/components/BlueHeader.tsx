import { Constants, globalStyles } from '@/src/helpers';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { router } from 'expo-router';
import { Image, View } from 'react-native'; // View is needed for spacers
import { Appbar } from 'react-native-paper';

interface Props {
  navigation?: {
    navigate: (screenName: string, params?: any) => void;
    openDrawer?: () => void;
  };
  showBack: boolean; // Changed from Boolean to boolean for consistency
  showMenu: boolean; // Changed from Boolean to boolean for consistency
}

const SPACER_WIDTH = DimensionHelper.wp(10); // Approx width of an Appbar.Action, adjust as needed

export function BlueHeader(props: Props) {
  // Appbar.Header handles safe area insets by default.
  // The outer globalStyles.headerContainer with gray_bg is omitted as Appbar.Header will be the main component.
  // If gray_bg is still needed around the Appbar, the usage of BlueHeader would need to be wrapped.

  const { showBack, showMenu, navigation } = props;

  // Adjusted logo style for flex layout
  const logoStyle = {
    ...globalStyles.blueMainIcon,
    flex: 1, // Allows the logo to take available space and center
    resizeMode: 'contain' as 'contain', // Ensure resizeMode is correctly typed
    // Remove margin and alignSelf from blueMainIcon if they conflict with flex centering
    margin: 0,
    alignSelf: undefined, // Let flexbox handle alignment
    width: DimensionHelper.wp(55), // Keep original width constraint
    height: DimensionHelper.wp(55), // Keep original height constraint
  };


  return (
    <Appbar.Header
      style={{
        backgroundColor: Constants.Colors.app_color,
        borderBottomLeftRadius: DimensionHelper.wp(8),
        borderBottomRightRadius: DimensionHelper.wp(8),
        justifyContent: 'space-between', // Distribute space for items
        alignItems: 'center', // Vertically align items
      }}
    >
      {showBack ? (
        <Appbar.BackAction
          onPress={() => router.back()}
          color={Constants.Colors.white_color}
          size={DimensionHelper.wp(6)} // Approximate original icon size
        />
      ) : (
        <View style={{ width: SPACER_WIDTH }} /> // Spacer
      )}

      <Image source={Constants.Images.logoWhite} style={logoStyle} />

      {showMenu && navigation?.openDrawer ? (
        <Appbar.Action
          icon="menu"
          onPress={navigation.openDrawer}
          color={Constants.Colors.white_color}
          size={DimensionHelper.wp(6)} // Approximate original icon size
        />
      ) : (
        <View style={{ width: SPACER_WIDTH }} /> // Spacer
      )}
    </Appbar.Header>
  );
}

BlueHeader.defaultProps = {
  showBack: false,
  showMenu: false,
};

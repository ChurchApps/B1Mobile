import { MainHeader } from '@/src/components/wrapper/MainHeader';
import React from 'react';
import { Dimensions, Image, SafeAreaView, View, StyleSheet } from 'react-native';
import { globalStyles } from '@/src/helpers';
import { NavigationProps } from '@/src/interfaces'; // Unused
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from 'expo-router'; // useNavigation from expo-router for Drawer
import { UserHelper } from "../../src/helpers/UserHelper";
import { useTheme } from 'react-native-paper';

// interface Props { // Unused
//   navigation: NavigationProps;
// }

const Votd = () => { // Removed props: Props
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [shape, setShape] = React.useState("9x16");

  const getShape = ({ window, screen }: { window?: any, screen: any }) => { // Added type for event listener param
    const { width, height } = screen; // Use screen dimensions from event
    const ratio = width / height;
    const diff1x1 = Math.abs(ratio - 1);
    const diff16x9 = Math.abs(ratio - 1.777);
    const diff9x16 = Math.abs(ratio - 0.5625);
    let result = "1x1";
    if (diff16x9 < diff1x1) result = "16x9";
    else if (diff9x16 < diff1x1) result = "9x16";
    setShape(result);
  };

  const getDayOfYear = () => {
    let now = new Date();
    let start = new Date(now.getFullYear(), 0, 0);
    let diff = now.getTime() - start.getTime();
    let oneDay = 1000 * 60 * 60 * 24;
    let day = Math.floor(diff / oneDay);
    return day;
  };

  React.useEffect(() => {
    UserHelper.addOpenScreenEvent("VOTD Screen");
    // Initial shape calculation
    const initialDim = Dimensions.get("screen");
    getShape({ screen: initialDim });

    const subscription = Dimensions.addEventListener("change", getShape);
    return () => subscription?.remove(); // Cleanup listener
  }, []);

  const day = getDayOfYear();
  const url = "https://votd.org/v1/" + day.toString() + "/" + shape + ".jpg";

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background, // Use theme background
    },
    contentContainer: {
      // from globalStyles.webViewContainer
      flex: 1,
      backgroundColor: theme.colors.surface, // Or background, depending on desired look for image container
    },
    image: {
      flex: 1,
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <MainHeader title="Verse of the Day" openDrawer={navigation.openDrawer} />
      <View style={styles.contentContainer}>
        <Image source={{ uri: url }} style={styles.image} resizeMode="contain" />
        {/* Changed resizeMode to "contain" for better image display */}
      </View>
    </SafeAreaView>
  );
};
export default Votd;

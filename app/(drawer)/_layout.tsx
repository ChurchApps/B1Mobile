import React from 'react';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { Drawer } from 'expo-router/drawer';
// useEffect and useState removed as dimensions state was unused in this file's logic
import { CustomDrawer } from '@/src/components/CustomDrawer';
// Constants removed
import { useTheme } from 'react-native-paper';


export default function DrawerLayout() {
  const theme = useTheme();
  // const [dimensions, setDimensions] = useState('1,1'); // Unused

  /*
  useEffect(() => {
    DimensionHelper.listenOrientationChange(undefined, () => {
      setDimensions(DimensionHelper.wp(100) + ',' + DimensionHelper.hp(100));
    });
    return () => DimensionHelper.removeOrientationListener();
  }, []);
  */

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: DimensionHelper.wp(60), // Consider making this responsive or fixed based on design
          // height: DimensionHelper.hp(100), // Drawer usually takes full height by default
          backgroundColor: theme.colors.surface, // Use themed background
        },
        drawerType: 'slide', // 'front', 'back', 'slide', 'permanent'
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      {/* Drawer screens are defined by files in this directory */}
    </Drawer>
  );
}

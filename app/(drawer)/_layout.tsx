import React from 'react';
import { DimensionHelper } from '@churchapps/mobilehelper';
import { Drawer } from 'expo-router/drawer';
import { useEffect, useState } from 'react';

import { CustomDrawer } from '@/src/components/CustomDrawer';
import { Constants } from '@/src/helpers';


export default function DrawerLayout() {
  const [dimensions, setDimensions] = useState('1,1');

  useEffect(() => {
    DimensionHelper.listenOrientationChange(undefined, () => {
      setDimensions(DimensionHelper.wp('100%') + ',' + DimensionHelper.hp('100%'));
    });
    return () => DimensionHelper.removeOrientationListener();
  }, []);

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: DimensionHelper.wp('60%'),
          height: DimensionHelper.hp('100%'),
          backgroundColor: Constants.Colors.app_color,
        },
        drawerType: 'slide',
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >

    </Drawer>
  );
}

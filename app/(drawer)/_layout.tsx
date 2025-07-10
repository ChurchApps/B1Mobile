import React from "react";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { Drawer } from "expo-router/drawer";

import { CustomDrawer } from "../../src/components/CustomDrawer";
import { Constants } from "@/helpers";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";

export default function DrawerLayout() {
  /*
  useEffect(() => {
    DimensionHelper.listenOrientationChange(undefined, () => {
      setDimensions(DimensionHelper.wp(100) + ',' + DimensionHelper.hp(100));
    });
    return () => DimensionHelper.removeOrientationListener();
  }, []);
  */

  return (
    <ErrorBoundary>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            width: DimensionHelper.wp(60),
            height: DimensionHelper.hp(100),
            backgroundColor: Constants.Colors.app_color
          },
          drawerType: "slide"
        }}
        drawerContent={props => <CustomDrawer {...props} />}></Drawer>
    </ErrorBoundary>
  );
}

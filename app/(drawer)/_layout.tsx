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
            width: 280, // Fixed width from style guide
            backgroundColor: "#F6F6F8" // Background from style guide
          },
          drawerType: "slide",
          overlayColor: "rgba(0, 0, 0, 0.5)" // Semi-transparent overlay
        }}
        drawerContent={props => <CustomDrawer {...props} />}></Drawer>
    </ErrorBoundary>
  );
}

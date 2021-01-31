import { DrawerNavigationProp, createDrawerNavigator } from "@react-navigation/drawer"

export const DrawerNav = createDrawerNavigator<DrawerScreens>();
export type drawerNavigationProps = DrawerNavigationProp<DrawerScreens, "Bible">


export type DrawerScreens = {
  Bible: { title: string, url: string },
  LiveStream: { title: string, url: string },
  Checkin: undefined,
  Page: { title: string, id: number },
  WebPage: { title: string, url: string },
}

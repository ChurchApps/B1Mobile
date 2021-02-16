import React from "react"
import { stackNavigationProps } from ".";
import { WebPage, Page } from "./drawer";
import { DrawerNav } from "./drawer/DrawerScreens";
import { CheckinContainer } from "./drawer/CheckinContainer"
import { SafeAreaView } from "react-native-safe-area-context";
import { Styles, UserHelper } from "./components";
import { View } from "react-native";
import { CustomDrawer } from "./components/CustomDrawer";

type Props = { navigation: stackNavigationProps; };

export const DrawerContainer = (props: Props) => {
    return (
        <SafeAreaView style={Styles.safeArea}>
            <View style={Styles.fullWidthContainer}>
                <DrawerNav.Navigator drawerContent={CustomDrawer} >
                    <DrawerNav.Screen name="Bible" component={WebPage} options={{ title: "Bible" }} initialParams={{ url: "https://biblegateway.com/", title: "Bible" }} />
                    <DrawerNav.Screen name="LiveStream" component={WebPage} options={{ title: "Live Stream" }} initialParams={{ url: "https://test.streaminglive.church/", title: "Live Stream" }} />
                    <DrawerNav.Screen name="Checkin" component={CheckinContainer} options={{ title: "Checkin" }} />
                    <DrawerNav.Screen name="Page" component={Page} options={{ title: "Page" }} initialParams={{ id: 0, title: "Page" }} />
                    <DrawerNav.Screen name="WebPage" component={WebPage} options={{ title: "Web Page" }} initialParams={{ url: "https://biblegateway.com/", title: "Web Page" }} />
                </DrawerNav.Navigator>
            </View>
        </SafeAreaView>
    );
}

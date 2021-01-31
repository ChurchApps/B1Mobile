import React from "react";
import { RouteProp } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import { Header, Styles } from "../components";
import { useDimensions } from "@react-native-community/hooks"
import { drawerNavigationProps } from "./DrawerScreens";

interface Props { route: RouteProp<any, "WebPage">, navigation: drawerNavigationProps }

export function WebPage(props: Props) {
    var url: string = props.route.params?.url || "";
    var title: string = props.route.params?.title || "";

    return (
        <>
            <Header title={title} navigation={props.navigation} />
            <WebView source={{ uri: url }} style={[Styles.webView]} />
        </>
    );
}

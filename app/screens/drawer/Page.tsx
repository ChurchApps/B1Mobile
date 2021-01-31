import React from "react";
import { RouteProp } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import { ApiHelper, Header, Styles, PageInterface } from "../components";
import { drawerNavigationProps } from "./DrawerScreens";

interface Props { route: RouteProp<any, "WebPage">, navigation: drawerNavigationProps }

export function Page(props: Props) {
    var title: string = props.route.params?.title || "";

    const [html, setHtml] = React.useState("Loading...");

    const loadData = () => {
        ApiHelper.apiGet("/pages/" + props.route.params?.id).then((page: PageInterface) => {
            setHtml(wrapContents(page.content || ""));
        });
    }

    const wrapContents = (contents: string) => {
        return "<html lang=\"en\"><head><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></meta></head><body style=\"padding-top:20px\">" + contents + "</body></html>";
    }

    React.useEffect(loadData, [props.route.params?.id]);

    return (
        <>
            <Header title={title} navigation={props.navigation} />
            <WebView source={{ html: html }} style={[Styles.webView]} />
        </>
    );
}

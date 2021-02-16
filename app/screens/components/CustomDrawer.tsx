import React from "react";
import { ScrollView, Text, View, Image } from "react-native";
import { NavigationActions, NavigationNavigateActionPayload, NavigationParams } from "react-navigation";
import { UserHelper, Styles, LinkInterface } from "../../helpers";
import { Icon } from "native-base"
import { DrawerContentComponentProps, DrawerContentOptions, DrawerItem } from "@react-navigation/drawer";
import { CachedData } from "../../helpers/CachedData";

export const CustomDrawer = (props: DrawerContentComponentProps<DrawerContentOptions>) => {

    /*
    const navigateToScreen = (routeName: string, params: NavigationParams) => {
        const options: NavigationNavigateActionPayload = { routeName: routeName, params }
        return () => { props.navigation.dispatch(NavigationActions.navigate(options)) };
    }*/

    const handleClick = (tab: LinkInterface) => {
        switch (tab.linkType) {
            case "checkin":
                navigate("Checkin");
                break;
            case "bible":
                navigate("Bible");
                break;
            case "stream":
                navigate("LiveStream");
                break;
            case "page":
                navigate("Page", { title: tab.text, id: tab.linkData });
                break;
            default:
                navigate("WebPage", { title: "Test", url: tab.url });
                break;
        }
    }

    const navigate = (routeName: string, params?: NavigationParams) => { props.navigation.navigate(routeName, params); }


    if (CachedData.tabs === null) { return <Text>Error loading nav</Text>; }

    const getIcon = (cssName: string) => {
        const solid = cssName.indexOf("fas") === 0;
        var name = cssName.replace("fas fa-", "").replace("far fa-", "");
        return <Icon name={name} solid={solid} type="FontAwesome5" style={Styles.navIcon} />
    }


    return (

        <View style={Styles.nav}>
            <View style={Styles.navChurchName}>
                <Icon name="church" solid={true} type="FontAwesome5" style={Styles.navIcon} />
                <Text style={Styles.navChurchNameText}>{CachedData.church?.name}</Text>
            </View>
            <ScrollView>
                <View >
                    {CachedData.tabs?.map(t => (
                        <View key={t.id} style={Styles.navLink}>
                            {getIcon(t.icon)}
                            <Text style={Styles.navLinkText} onPress={() => { handleClick(t) }} >{t.text}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
            <View style={Styles.navLink}>
                <Text style={Styles.navLinkText} onPress={() => { navigate("LiveStream") }}>Profile</Text>
            </View>

        </View>
    );

}

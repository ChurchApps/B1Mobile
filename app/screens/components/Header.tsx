import React from "react";
import { StyleSheet, Text, View, Platform, StatusBar } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { drawerNavigationProps } from "../drawer";

interface Props { title: string, navigation: drawerNavigationProps }

export function Header(props: Props) {
    const handlePress = () => {
        props.navigation.toggleDrawer();
    }

    return (
        <View style={styles.header} >
            <FontAwesome name="bars" onPress={handlePress} style={styles.hamburger} />
            <Text onPress={handlePress} style={styles.text}>{props.title}</Text>
        </View>
    );
}


const styles = StyleSheet.create({
    header: {
        paddingBottom: 5,
        //paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        paddingTop: 0,
        width: "100%",
        backgroundColor: "#1b75bc",
        color: "#FFF",
        flexDirection: "row"
    },
    text: { color: "#FFF", fontSize: 20, flex: 1, textAlign: "center", marginLeft: -50 },
    hamburger: { color: "#FFF", marginLeft: 20, fontSize: 20 }
});

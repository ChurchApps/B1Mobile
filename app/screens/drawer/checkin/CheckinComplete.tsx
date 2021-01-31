import React from "react"
import { View, Text, NativeModules } from "react-native"
import { CommonActions } from "@react-navigation/native";
import Ripple from "react-native-material-ripple";
import { ChumsCachedData, Utils, ApiHelper, Styles } from "./components"
import { checkinNavigationProps } from "./CheckinScreens"

interface Props { navigation: checkinNavigationProps; }


export const CheckinComplete = (props: Props) => {

    const [html, setHtml] = React.useState("Hello world");

    const print = () => {
        NativeModules.PrinterHelper.init();
        checkin();
        props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Lookup" }] }));
    }


    const checkin = () => {
        ApiHelper.apiPost("/visits/checkin?serviceId=" + ChumsCachedData.serviceId + "&householdId=" + ChumsCachedData.householdId, ChumsCachedData.pendingVisits).then(data => {
            if (data !== "error") props.navigation.navigate("CheckinComplete")
            else Utils.errorMsg("Something went wrong")
        }).catch((error) => {
            setHtml("error");
        });
    }


    return (
        <View style={Styles.mainContainer}>
            <Text style={Styles.H1}>Checkin Complete.</Text>
            <Ripple style={Styles.bigButton} onPress={() => { print() }}>
                <Text style={Styles.bigButtonText}>Print</Text>
            </Ripple>
        </View>
    )
}
import React from "react";
import { View, Image } from "react-native";
import { Styles } from "../../helpers";

export function LogoHeader() {
    return (<View style={Styles.headerImageView}>
        <Image source={require("../../images/LogoWhite.png")} style={Styles.headerImage} resizeMode="contain" />
    </View>);
}





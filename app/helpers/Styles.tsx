import { StyleSheet, Dimensions } from "react-native"

export class StyleConstants {
    static deviceWidth = Dimensions.get("window").width;
    static deviceHeight = Dimensions.get("window").height;

    static fontSize = StyleConstants.deviceWidth * 4 / 100;
    static fontSize1 = StyleConstants.deviceWidth * 4.5 / 100;
    static fontSize2 = StyleConstants.deviceWidth * 5 / 100;
    static smallFont = StyleConstants.deviceWidth * 3.6 / 100;
    static smallerFont = StyleConstants.deviceWidth * 3.0 / 100;

    //Colors
    static baseColor = "#24B8FE"
    static baseColor1 = "#08A1CD"
    static blueColor = "#2196F3"
    static darkColor = "#3c3c3c";
    static blackColor = "black";
    static grayColor = "gray";
    static lightGrayColor = "lightgray";
    static whiteColor = "white";
    static yellowColor = "#FEAA24";
    static greenColor = "#70DC87";
    static redColor = "#B0120C";
    static cyanColor = "#1C9BA0";
    static darkPink = "#FF69B4";
    static ghostWhite = "#F6F6F8";
    static logoBlue = "#1B75BC";

    //Font
    static RobotoLight = "Roboto_300Light";
    static RobotoRegular = "Roboto_400Regular";
    static RobotoMedium = "Roboto_500Medium";
    static RobotoBold = "Roboto_700Bold";
    static RobotoBlack = "Roboto_900Black";
}


export const Styles = StyleSheet.create({
    //Global styles
    blueBackground: { flex: 1, backgroundColor: StyleConstants.logoBlue },
    safeArea: { backgroundColor: StyleConstants.logoBlue, flex: 1 },
    mainContainer: { paddingHorizontal: "5%", backgroundColor: StyleConstants.ghostWhite, flex: 1, },
    fullWidthContainer: { backgroundColor: StyleConstants.ghostWhite, flex: 1, },
    H1: { fontSize: StyleConstants.fontSize2, alignSelf: "flex-start", marginVertical: "4%", fontFamily: StyleConstants.RobotoLight },
    headerImageView: { height: StyleConstants.deviceHeight * 30 / 100, width: "100%", backgroundColor: StyleConstants.logoBlue },
    headerImage: { maxWidth: StyleConstants.deviceWidth * 70 / 100, height: StyleConstants.deviceHeight * 20 / 100, alignSelf: "center", marginTop: StyleConstants.deviceHeight * 0.05 },
    printerStatus: { backgroundColor: "#09A1CD", height: 30, justifyContent: "center", flexDirection: "row" },
    content: { backgroundColor: StyleConstants.ghostWhite, paddingBottom: "5%", flex: 1, },
    label: { fontSize: StyleConstants.fontSize, alignSelf: "flex-start", marginVertical: "4%", fontFamily: StyleConstants.RobotoLight },
    textInput: { backgroundColor: StyleConstants.whiteColor, paddingHorizontal: "3%", fontSize: StyleConstants.smallFont, minHeight: 40 },
    flatlistDropIcon: { fontSize: StyleConstants.fontSize, color: StyleConstants.lightGrayColor, marginRight: "2%" },

    //Nav
    nav: { flex: 1, paddingTop: 30, backgroundColor: StyleConstants.logoBlue },
    navChurchName: { flexDirection: "row", marginLeft: 10 },
    navChurchNameText: { fontSize: StyleConstants.fontSize, fontFamily: StyleConstants.RobotoBlack, fontWeight: "900", marginBottom: 30, color: StyleConstants.whiteColor },
    navLink: { marginLeft: 20, marginBottom: 30, flexDirection: "row" },
    navLinkText: { fontSize: StyleConstants.fontSize, lineHeight: 20, textAlign: "left", fontFamily: StyleConstants.RobotoMedium, fontWeight: "500", color: StyleConstants.whiteColor },
    navIcon: { fontSize: StyleConstants.fontSize, color: StyleConstants.whiteColor, marginRight: StyleConstants.fontSize * 0.5 },

    //Buttons
    button: { backgroundColor: StyleConstants.baseColor, marginVertical: "8%", height: 50, justifyContent: "center", flexDirection: "row", },
    buttonText: { alignSelf: "center", color: StyleConstants.whiteColor, fontSize: StyleConstants.smallerFont },
    bigButton: { backgroundColor: StyleConstants.baseColor, marginVertical: "8%", height: 70, justifyContent: "center", flexDirection: "row", },
    bigButtonText: { alignSelf: "center", color: StyleConstants.whiteColor, fontSize: StyleConstants.smallFont },
    bigLinkButton: { marginHorizontal: "3%", height: StyleConstants.deviceWidth * 13 / 100, justifyContent: "center", },
    bigLinkButtonText: { color: StyleConstants.baseColor1, marginLeft: "3%", fontSize: StyleConstants.fontSize1, },
    blockButtons: { height: StyleConstants.deviceWidth * 0.13, width: "100%", flexDirection: "row" },
    blockButton: { backgroundColor: StyleConstants.baseColor1, justifyContent: "center", flex: 1, alignContent: "center", flexDirection: "row" },
    blockButtonText: { color: StyleConstants.whiteColor, fontSize: StyleConstants.smallFont, marginTop: (StyleConstants.deviceWidth * 0.13 - StyleConstants.smallFont) * 0.5 },

    webView: { flex: 1, height: "100%", width: StyleConstants.deviceWidth },

    //Splash
    splashMaincontainer: { alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: StyleConstants.logoBlue },


    //Checkin
    flatlistMainView: { borderBottomWidth: 1, borderBottomColor: StyleConstants.lightGrayColor, flexDirection: "row", paddingVertical: "3%", alignItems: "center" },
    personPhoto: { width: 90, height: 60 },
    personName: { color: StyleConstants.baseColor1, fontSize: StyleConstants.fontSize1 },
    serviceTimeButton: { backgroundColor: StyleConstants.baseColor1, width: StyleConstants.deviceWidth * 45 / 100, justifyContent: "center", alignItems: "center", height: 70, },
    serviceTimeButtonText: { color: StyleConstants.whiteColor, fontSize: StyleConstants.smallerFont },
    serviceTimeText: { fontSize: StyleConstants.smallFont },
    expandedRow: { borderBottomWidth: 1, borderBottomColor: StyleConstants.lightGrayColor, flexDirection: "row", marginHorizontal: "6%", paddingVertical: "3%", paddingLeft: "2%", alignItems: "center", justifyContent: "space-around" },

    /*
    container: { flex: 1, backgroundColor: "#1b75bc", alignItems: "center", justifyContent: "center", },
    label: { color: StyleConstants.blackColor, marginTop: 10, },
    heading: { color: StyleConstants.blackColor, fontSize: StyleConstants.fontSize1, marginTop: 10, },
    button: { backgroundColor: StyleConstants.blueColor, justifyContent: "center", flexDirection: "row", paddingVertical: 12, },
    buttonText: { color: "#FFF", fontSize: StyleConstants.smallFont },
    textInput: { backgroundColor: StyleConstants.whiteColor, paddingHorizontal: "3%", fontSize: StyleConstants.smallFont, },
    mainView: { flex: 1, backgroundColor: "#FFF", width: "100%", paddingHorizontal: 20 },
    splashMaincontainer: { alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: "#1b75bc" },
    headerImage: { maxWidth: StyleConstants.deviceWidth * 70 / 100, height: StyleConstants.deviceHeight * 20 / 100, alignSelf: "center" },
    */
})
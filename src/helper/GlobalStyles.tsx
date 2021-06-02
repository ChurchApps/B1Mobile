import { StyleSheet } from "react-native";
import Colors from "../utils/Colors";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Fonts from "../utils/Fonts";

const globalStyles = StyleSheet.create({
    //Global Styles
    appContainer: { flex: 1, backgroundColor: Colors.app_color },
    grayContainer: { flex: 1, backgroundColor: Colors.gray_bg },
    textInputView: { height: wp('12%'), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: wp('5.5%'), marginHorizontal: wp('5%'), backgroundColor: 'white', borderRadius: wp('2%'), shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: wp('1.5%'), elevation: 5 },
    textInputStyle: { height: wp('10%'), width: wp('80%'), alignItems: 'center', justifyContent: 'center', fontSize: wp('3.8%'), color: 'gray' },
    roundBlueButton: { height: wp('12%'), width: wp('90%'), borderRadius: wp('2%'), justifyContent: 'center', alignItems: 'center', alignSelf: 'center', backgroundColor: Colors.button_bg, marginTop: wp('8%') },
    roundBlueButtonText: { color: 'white', fontSize: wp('3.8%'), fontFamily: Fonts.RobotoMedium },
    searchIcon: { width: wp('6%'), height: wp('6%'), margin: wp('1.5%') },
    listTextView: { height: wp('12%'), justifyContent: 'space-evenly' },
    listTitleText: { fontSize: wp('4.2%'), fontFamily: Fonts.RobotoMedium },
    listMainView: { width: wp('90%'), backgroundColor: 'white', alignSelf: 'center', justifyContent: 'flex-start', alignItems: 'center', marginVertical: wp('2%'), borderRadius: wp('2%'), shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: wp('1.5%'), elevation: 5, shadowColor: Colors.app_color, flexDirection: 'row' },
    listContainerStyle: { marginVertical: wp('3%') },
    selectionIcon: { fontSize: wp('6%'), color: 'gray', marginLeft: wp('3%') },
    groupListTitle: { fontSize: wp('4.5%'), fontFamily: Fonts.RobotoMedium, color: Colors.app_color },
    safeAreaContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    //Splash
    splashImage:{ width: wp('100%'), height: hp('100%') },

    //Login
    inputIcon: { width: wp('4.5%'), height: wp('4.5%'), margin: wp('3%') },
    mainText: { marginHorizontal: wp('5%'), marginTop: wp('8%'), fontSize: wp('4.8%'), fontFamily: Fonts.RobotoMedium },

    //Church Search
    searchMainText: { marginHorizontal: wp('5%'), marginTop: wp('8%'), fontSize: wp('4.5%'), fontFamily: Fonts.RobotoLight },
    churchListView: { height: wp('16%'), shadowOpacity: 0.1 },
    churchListIcon: { width: wp('12%'), height: wp('12%'), marginHorizontal: wp('2.5%'), borderRadius: wp('1.5%') },
    churchListStyle: { marginVertical: wp('2%') },
    recentText: { marginHorizontal: wp('5%'), marginTop: wp('5%'), fontSize: wp('4%'), fontFamily: Fonts.RobotoRegular },

    //Home
    homeContainer: { flex:1, backgroundColor: 'white' },
    menuIcon: { width: wp('6%'), height: wp('6%'), margin: wp('5%'), tintColor: 'white' },
    headerText: { color: 'white', textAlign:'center', fontSize: wp('4.5%'), fontWeight: 'bold' },
    webViewContainer: { flex: 1, height: hp('100%'), width: wp('100%') },

    //Service
    groupListView: { height: wp('15%'), justifyContent: 'center' },

    //Household
    memberListIcon: { width: wp('16%'), height: wp('16%'), marginHorizontal: wp('2%'), marginVertical: wp('2%'), borderRadius: wp('1.5%') },
    memberListTextView: { width: wp('62%'), marginVertical: wp('2%'), justifyContent: 'space-evenly' },
    memberListTitle: { color: Colors.app_color, marginLeft: wp('2%'), width: wp('65%') },
    timeIcon: { fontSize: wp('5%'), color: Colors.app_color, marginHorizontal: wp('1%') },
    classesView: { width: wp('90%'), flexDirection: 'row', alignSelf: 'center', justifyContent: 'space-between', alignItems: 'center', marginTop: wp('2%'), paddingBottom: wp('2%'), borderBottomWidth: 1, borderBottomColor: 'lightgray' },
    classesNoneBtn: { width: wp('55%'), height: wp('16%'), marginHorizontal: wp('2%'), alignItems: 'center', justifyContent: 'center', borderRadius: wp('2%') },
    classesTimeView: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    classesTimeText: { textAlign: 'center', fontSize: wp('3.7%'), color: Colors.app_color },
    selectedText: { width: wp('62%'), textAlign: 'left', fontSize: wp('3.4%'), color: Colors.button_green, marginLeft: wp('2%'), marginVertical: wp('0.5%') },
    classesNoneText: { width: wp('50%'), color: 'white', fontSize: wp('3.5%'), textAlign: 'center' },

    //Groups
    groupMainTitle: { marginLeft: wp('3%'), width: wp('65%') },
    groupView: { width: wp('80%'), flexDirection: 'row', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: wp('2%'), paddingBottom: wp('2%'), borderBottomWidth: 1, borderBottomColor: 'lightgray' },
    groupBtn: { width: wp('75%'), height: wp('8%'), alignItems: 'flex-start', justifyContent: 'center' },
    groupText: { color: Colors.app_color, fontSize: wp('4.2%'), marginHorizontal: wp('2.5%') },

    //Complete
    successIcon: { fontSize: wp('20%'), color: Colors.button_green },
    successText: { fontFamily: Fonts.RobotoLight, fontSize: wp('5%'), color: 'black', marginVertical: wp('5%') },

    //Member Details
    memberIcon: { width: wp('25%'), height: wp('25%'), borderRadius: wp('12.5%'), alignSelf: 'center', marginTop: wp('8%') },
    memberName: { marginHorizontal: wp('5%'), marginBottom: wp('2%'), fontSize: wp('4.8%'), fontFamily: Fonts.RobotoRegular, alignSelf: 'center', marginTop: wp('4%') },
    memberDetailContainer: { marginHorizontal: wp('5%'),  marginVertical: wp('2%'), backgroundColor: 'white', shadowColor: Colors.app_color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: wp('1%'), elevation: 3, borderRadius: wp('1.5%')},
    detailHeader: { marginVertical: wp('2%'), fontSize: wp('3.9%'), fontFamily: Fonts.RobotoLight },
    detailIcon: { width: wp('4.8%'), height: wp('4.8%'), margin: wp('3%'), marginTop: wp('2.5%'), marginLeft: wp('5%')},
    detailIconContainer: {flexDirection: 'row', alignItems:'center'},
    detailValue: { marginHorizontal: wp('5%'), marginBottom: wp('2%'), fontSize: wp('4.4%'), fontFamily: Fonts.RobotoRegular },

    //BlueLogo
    headerContainer: { backgroundColor: Colors.gray_bg },
    blueLogoView: { borderBottomLeftRadius: wp('8%'), borderBottomRightRadius: wp('8%'), backgroundColor: Colors.app_color },
    blueMainIcon: { width: wp('55%'), height: wp('55%'), margin: wp('5%'), resizeMode: 'contain', alignSelf: 'center' },

    //BottomButton
    bottomBtn: { width: wp('100%'), height: wp('15%'), alignItems: 'center', justifyContent: 'center' },
    classesText: { color: 'white', fontSize: wp('4.2%'), marginHorizontal: wp('2.5%'), textAlign: 'center' },

    //CustomDrawer
    userIcon: { width: wp('10%'), height: wp('10%'), margin: wp('4%'), borderRadius: wp('5%') },
    headerView: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
    userNameText: { fontSize: wp('3.8%'), fontFamily: Fonts.RobotoRegular },
    tabIcon: { width: wp('6%'), height: wp('6%'), marginVertical: wp('2%'), marginHorizontal: wp('4%') },
    tabTitle: { fontSize: wp('4%'), fontFamily: Fonts.RobotoRegular },
    churchBtn: { borderBottomColor: 'lightgray', borderBottomWidth: 1, marginHorizontal: wp('4%'), marginTop: wp('6%'), marginBottom: wp('2%'), borderRadius: wp('1.5%'), flexDirection: 'row', alignItems: 'center' },
    churchText: { fontSize: wp('3.7%'), paddingVertical: wp('1.5%'), fontFamily: Fonts.RobotoRegular, marginHorizontal: wp('1%') },
    logoutBtn: { marginTop: wp('10%'), marginLeft: wp('5%') },

    //Loader
    indicatorStyle: { position: 'absolute', left: 0, top: 0, backgroundColor: 'rgba(255,255,255,0.5)', width:wp('100%'), height:hp('100%'), alignItems:'center', justifyContent: 'center' },

    //MainHeader
    headerViewStyle: { flex: 0, flexDirection: 'row', zIndex: 30, alignItems: 'center', justifyContent: 'space-evenly', backgroundColor: Colors.app_color },
    componentStyle: { color: Colors.app_color, alignSelf: 'center', justifyContent: 'center' },

    //WhiteLogo
    headerLogoView: { borderBottomLeftRadius: wp('8%'), borderBottomRightRadius: wp('8%'), backgroundColor: 'white', shadowColor: Colors.app_color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: wp('1.5%'), elevation: 5 },
    whiteMainIcon: { width: wp('55%'), height: wp('55%'), marginTop: wp('10%'), marginBottom: wp('4%'), resizeMode: 'contain', alignSelf: 'center' },
    logoMenuIcon: { width: wp('6%'), height: wp('6%'), marginLeft: wp('5%') },
    logoMenuBtn: { position: 'absolute' }
})

export default globalStyles;
import { StyleSheet } from "react-native";
import { Constants } from "../helpers";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export const globalStyles = StyleSheet.create({
  //Global Styles
  appContainer: { flex: 1, backgroundColor: Constants.Colors.app_color },
  grayContainer: { flex: 1, backgroundColor: Constants.Colors.gray_bg },
  textInputView: { height: wp('12%'), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: wp('5.5%'), marginHorizontal: wp('5%'), backgroundColor: 'white', borderRadius: wp('2%'), shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: wp('1.5%'), elevation: 5 },
  textInputStyle: { height: wp('10%'), width: wp('80%'), alignItems: 'center', justifyContent: 'center', fontSize: wp('3.8%'), color: 'gray' },
  roundBlueButton: { height: wp('12%'), width: wp('90%'), borderRadius: wp('2%'), justifyContent: 'center', alignItems: 'center', alignSelf: 'center', backgroundColor: Constants.Colors.button_bg, marginTop: wp('8%') },
  roundBlueButtonText: { color: 'white', fontSize: wp('3.8%'), fontFamily: Constants.Fonts.RobotoMedium },
  searchIcon: { width: wp('6%'), height: wp('6%'), margin: wp('1.5%') },
  listTextView: { height: wp('12%'), justifyContent: 'space-evenly' },
  listTitleText: { fontSize: wp('4.2%'), fontFamily: Constants.Fonts.RobotoMedium },
  listMainView: { width: wp('90%'), backgroundColor: 'white', alignSelf: 'center', justifyContent: 'flex-start', alignItems: 'center', marginVertical: wp('2%'), borderRadius: wp('2%'), shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: wp('1.5%'), elevation: 5, shadowColor: Constants.Colors.app_color, flexDirection: 'row' },
  listContainerStyle: { marginVertical: wp('3%') },
  selectionIcon: { color: 'gray', marginLeft: wp('3%') },
  groupListTitle: { fontSize: wp('4.5%'), fontFamily: Constants.Fonts.RobotoMedium, color: Constants.Colors.app_color },
  safeAreaContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  loginLinks: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },

  simpleLink: { textDecorationLine: "underline", color: Constants.Colors.button_bg },


  //Splash
  splashImage: { width: wp('100%'), height: hp('100%') },

  //Login
  inputIcon: { width: wp('4.5%'), height: wp('4.5%'), margin: wp('3%') },
  mainText: { marginHorizontal: wp('5%'), marginTop: wp('8%'), fontSize: wp('4.8%'), fontFamily: Constants.Fonts.RobotoMedium },

  //Church Search
  searchMainText: { marginHorizontal: wp('5%'), marginTop: wp('8%'), fontSize: wp('4.5%'), fontFamily: Constants.Fonts.RobotoLight },
  churchListView: { height: wp('16%'), shadowOpacity: 0.1 },
  churchListIcon: { width: wp('12%'), height: wp('12%'), marginHorizontal: wp('2.5%'), borderRadius: wp('1.5%') },
  churchListStyle: { marginVertical: wp('2%') },
  recentText: { marginHorizontal: wp('5%'), marginTop: wp('5%'), fontSize: wp('4%'), fontFamily: Constants.Fonts.RobotoRegular },

  //Home
  homeContainer: { flex: 1, backgroundColor: 'white' },
  menuIcon: { width: wp('6%'), height: wp('6%'), margin: wp('5%'), tintColor: 'white' },
  headerText: { color: 'white', textAlign: 'center', fontSize: wp('4.5%'), fontWeight: 'bold' },
  webViewContainer: { flex: 1, height: hp('100%'), width: wp('100%') },

  //Service
  groupListView: { height: wp('15%'), justifyContent: 'center' },

  //Household
  memberListIcon: { width: wp('16%'), height: wp('16%'), marginHorizontal: wp('2%'), marginVertical: wp('2%'), borderRadius: wp('1.5%') },
  memberListTextView: { width: wp('62%'), marginVertical: wp('2%'), justifyContent: 'space-evenly' },
  memberListTitle: { color: Constants.Colors.app_color, marginLeft: wp('2%'), width: wp('65%') },
  timeIcon: { fontSize: wp('5%'), color: Constants.Colors.app_color, marginHorizontal: wp('1%') },
  classesView: { width: wp('90%'), flexDirection: 'row', alignSelf: 'center', justifyContent: 'space-between', alignItems: 'center', marginTop: wp('2%'), paddingBottom: wp('2%'), borderBottomWidth: 1, borderBottomColor: 'lightgray' },
  classesNoneBtn: { width: wp('55%'), height: wp('16%'), marginHorizontal: wp('2%'), alignItems: 'center', justifyContent: 'center', borderRadius: wp('2%') },
  classesTimeView: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  classesTimeText: { textAlign: 'center', fontSize: wp('3.7%'), color: Constants.Colors.app_color },
  selectedText: { width: wp('62%'), textAlign: 'left', fontSize: wp('3.4%'), color: Constants.Colors.button_green, marginLeft: wp('2%'), marginVertical: wp('0.5%') },
  classesNoneText: { width: wp('50%'), color: 'white', fontSize: wp('3.5%'), textAlign: 'center' },

  //Groups
  groupMainTitle: { marginLeft: wp('3%'), width: wp('65%') },
  groupView: { width: wp('80%'), flexDirection: 'row', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: wp('2%'), paddingBottom: wp('2%'), borderBottomWidth: 1, borderBottomColor: 'lightgray' },
  groupBtn: { width: wp('75%'), height: wp('8%'), alignItems: 'flex-start', justifyContent: 'center' },
  groupText: { color: Constants.Colors.app_color, fontSize: wp('4.2%'), marginHorizontal: wp('2.5%') },

  //Complete
  successIcon: { fontSize: wp('20%'), color: Constants.Colors.button_green },
  successText: { fontFamily: Constants.Fonts.RobotoLight, fontSize: wp('5%'), color: 'black', marginVertical: wp('5%') },

  //Member Details
  memberIcon: { width: wp('25%'), height: wp('25%'), borderRadius: wp('12.5%'), alignSelf: 'center', marginTop: wp('8%') },
  memberName: { marginHorizontal: wp('5%'), marginBottom: wp('2%'), fontSize: wp('4.8%'), fontFamily: Constants.Fonts.RobotoRegular, alignSelf: 'center', marginTop: wp('4%') },
  memberDetailContainer: { marginHorizontal: wp('5%'), marginVertical: wp('2%'), backgroundColor: 'white', shadowColor: Constants.Colors.app_color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: wp('1%'), elevation: 3, borderRadius: wp('1.5%') },
  detailHeader: { marginVertical: wp('2%'), fontSize: wp('3.9%'), fontFamily: Constants.Fonts.RobotoLight },
  detailIcon: { width: wp('4.8%'), height: wp('4.8%'), margin: wp('3%'), marginTop: wp('2.5%'), marginLeft: wp('5%') },
  detailIconContainer: { flexDirection: 'row', alignItems: 'center' },
  detailValue: { marginHorizontal: wp('5%'), marginBottom: wp('2%'), fontSize: wp('4.4%'), fontFamily: Constants.Fonts.RobotoRegular },

  //BlueLogo
  headerContainer: { backgroundColor: Constants.Colors.gray_bg },
  blueLogoView: { borderBottomLeftRadius: wp('8%'), borderBottomRightRadius: wp('8%'), backgroundColor: Constants.Colors.app_color },
  blueMainIcon: { width: wp('55%'), height: wp('55%'), margin: wp('5%'), resizeMode: 'contain', alignSelf: 'center' },

  //BottomButton
  bottomBtn: { width: wp('100%'), height: wp('15%'), alignItems: 'center', justifyContent: 'center' },
  classesText: { color: 'white', fontSize: wp('4.2%'), marginHorizontal: wp('2.5%'), textAlign: 'center' },

  //CustomDrawer
  drawerStyle: { backgroundColor: Constants.Colors.app_color, color: 'white' },
  userIcon: { width: wp('6%'), height: wp('6%'), margin: wp('2%'), borderRadius: wp('2%') },
  headerView: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  userNameText: { fontSize: wp('3.2%'), fontFamily: Constants.Fonts.RobotoRegular, color: 'white' },
  tabIcon: { width: wp('6%'), maxHeight: wp('10%'), marginVertical: wp('2%'), marginHorizontal: wp('3%'), color: 'white' },
  tabTitle: { fontSize: wp('3%'), fontFamily: Constants.Fonts.RobotoRegular, color: 'white' },
  churchBtn: { borderBottomColor: 'lightgray', borderBottomWidth: 1, marginHorizontal: wp('4%'), marginTop: wp('6%'), marginBottom: wp('2%'), borderRadius: wp('1.5%'), flexDirection: 'row', alignItems: 'center', color: 'white' },
  churchText: { fontSize: wp('3.7%'), paddingVertical: wp('1.5%'), fontFamily: Constants.Fonts.RobotoRegular, marginHorizontal: wp('1%'), color: 'white' },
  logoutBtn: { marginTop: wp('10%'), marginLeft: wp('5%'), color: 'white' },
  drawerText: { color: 'white' },



  //Loader
  indicatorStyle: { position: 'absolute', left: 0, top: 0, backgroundColor: 'rgba(255,255,255,0.5)', width: wp('100%'), height: hp('100%'), alignItems: 'center', justifyContent: 'center' },

  //MainHeader
  headerViewStyle: { flex: 0, flexDirection: 'row', zIndex: 30, alignItems: 'center', justifyContent: 'space-evenly', backgroundColor: Constants.Colors.app_color },
  componentStyle: { color: Constants.Colors.app_color, alignSelf: 'center', justifyContent: 'center' },

  //WhiteLogo
  headerLogoView: { borderBottomLeftRadius: wp('8%'), borderBottomRightRadius: wp('8%'), backgroundColor: 'white', shadowColor: Constants.Colors.app_color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: wp('1.5%'), elevation: 5 },
  whiteMainIcon: { width: wp('55%'), height: wp('55%'), marginTop: wp('2%'), marginBottom: wp('2%'), resizeMode: 'contain', alignSelf: 'center' },
  logoMenuIcon: { width: wp('6%'), height: wp('6%'), marginLeft: wp('5%') },
  logoMenuBtn: { position: 'absolute' },

  //Donate
  dropDownMainStyle: { borderColor: 'lightgray', borderWidth: 1 },
  dropDownStyle: { backgroundColor: 'lightgray', width: wp('90%'), borderColor: 'gray', elevation: 999, zIndex: 10 },
  itemStyle: { justifyContent: 'flex-start', borderBottomWidth: 1, borderColor: 'gray', height: wp('11.5%'), paddingLeft: wp('2%') },
  labelStyle: { fontSize: wp('4.2%') },
  containerStyle: { height: wp('10%'), width: wp('90%'), marginHorizontal: wp('5%'), marginTop: wp('2%') },
  containerStyleAndroid: { height: wp('10%'), width: wp('86%'), marginHorizontal: wp('5%') },
  dropDownContainer: { height: wp('14%'), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: wp('5%'), borderRadius: wp('3%'), borderColor: 'lightgray', borderWidth: 1 },
  methodContainer: { flexDirection: 'row', width: wp('90%'), justifyContent: 'space-between', alignSelf: 'center', marginVertical: wp('4%') },
  methodButton: { backgroundColor: 'white', alignSelf: 'center', alignItems: 'center', marginVertical: wp('2%'), borderRadius: wp('2%'), shadowOffset: { width: 0, height: 0 }, elevation: 5, shadowColor: Constants.Colors.app_color, flexDirection: 'row', height: wp('15%'), width: wp('42.5%'), justifyContent: 'center', shadowOpacity: 0.3, shadowRadius: wp('2%') },
  methodBtnText: { fontFamily: Constants.Fonts.RobotoMedium, color: Constants.Colors.app_color, width: wp('40%'), textAlign: 'center', fontSize: wp('4.2%') },
  fundView: { width: wp('100%'), flexDirection: 'row', justifyContent: 'space-between' },
  fundInput: { fontSize: wp('4.2%'), height: wp('12%'), width: wp('40%'), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'lightgray', borderRadius: wp('2%'), paddingHorizontal: wp('2%'), marginLeft: wp('5%'), marginTop: wp('2%') },
  intervalView: { width: wp('100%'), flexDirection: 'row', justifyContent: 'space-between' },
  intervalInput: { fontSize: wp('4.2%'), height: wp('12%'), width: wp('40%'), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'lightgray', borderRadius: wp('2%'), paddingHorizontal: wp('2%'), marginLeft: wp('5%'), marginTop: wp('2%') },
  cardDatesView: { width: wp('95%'), flexDirection: 'row', justifyContent: "space-around", marginBottom: wp("2%") },
  cardDates: { fontSize: wp('4.2%'), height: wp('12%'), width: wp('40%'), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'lightgray', borderRadius: wp('2%'), paddingHorizontal: wp('2%'), marginLeft: wp('5%'), marginTop: wp('2%') },
  dateInput: { borderWidth: 1, marginHorizontal: wp('5%'), paddingHorizontal: wp('2%'), borderColor: 'lightgray', borderRadius: wp('2%'), height: wp('12%'), marginTop: wp('2%'), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1, alignSelf: 'stretch' },
  dateText: { width: wp('65%'), fontSize: wp('3.8%') },
  notesInputView: { height: wp('20%'), alignItems: 'center', justifyContent: 'center', fontSize: wp('4.2%'), borderWidth: 1, borderColor: 'lightgray', borderRadius: wp('2%'), paddingHorizontal: wp('2%'), margin: wp('5%'), textAlignVertical: "top" },
  semiTitleText: { marginHorizontal: wp('5%'), fontSize: wp('4.5%'), fontFamily: Constants.Fonts.RobotoLight, marginTop: wp('5%') },
  addMoreText: { color: Constants.Colors.app_color, fontSize: wp('4%'), marginHorizontal: wp('5%'), marginTop: wp('2%') },
  previewBtnView: { flexDirection: 'row', justifyContent: 'space-evenly', width: wp('100%'), marginTop: wp('2%') },
  previewBtn: { height: wp('12%'), width: wp('50%'), justifyContent: 'center' },
  previewBtnText: { textAlign: 'center', width: wp('50%'), color: 'white', fontSize: wp('4.7%'), fontFamily: Constants.Fonts.RobotoMedium },
  actionButtons: { height: wp('12%'), width: wp('50%'), justifyContent: 'center', alignItems: "center" },
  totalText: { marginHorizontal: wp('5%'), fontSize: wp('4.5%'), marginTop: wp('5%') },
  notesInput: { fontSize: wp('4.2%'), width: wp('90%'), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'lightgray', borderRadius: wp('2%'), paddingHorizontal: wp('2%'), marginLeft: wp('5%'), marginTop: wp('2%'), marginBottom: wp("2%") },
  donationContainer: { width: wp('100%'), alignItems: 'center', marginVertical: wp('2%') },

  previewView: { flexDirection: 'row', paddingVertical: wp('3%'), borderBottomWidth: 1, borderBottomColor: 'lightgray' },
  previewTitleText: { width: wp('30%'), fontFamily: Constants.Fonts.RobotoRegular, fontSize: wp('4.2%') },
  previewDetailText: { width: wp('50%'), fontFamily: Constants.Fonts.RobotoRegular, fontSize: wp("4.2%") },
  donationPreviewView: { width: '100%', height: wp('14%'), marginBottom: wp('3%'), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: 'lightgray', borderBottomWidth: 1 },
  donationText: { fontSize: wp('5.5%'), fontFamily: Constants.Fonts.RobotoRegular },
  donationCloseBtn: { height: wp('8%'), width: wp('8%'), justifyContent: 'center' },
  closeIcon: { color: 'gray', alignSelf: 'center' },
  popupBottomContainer: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: wp('5%') },
  popupButton: { height: wp('12%'), justifyContent: 'center', borderRadius: wp('1.5%'), width: wp("30%") },
  popupButonText: { textAlign: 'center', color: 'white', fontSize: wp('4.7%'), fontFamily: Constants.Fonts.RobotoMedium, paddingHorizontal: wp('3%') },

  cardListView: { width: wp('90%'), flexDirection: 'row', justifyContent: 'space-between', marginVertical: wp('5%'), alignSelf: 'center' },
  cardListText: { fontSize: wp('4.2%'), textAlign: 'left', fontFamily: Constants.Fonts.RobotoRegular, alignSelf: 'center' },
  cardListSeperator: { height: 0.5, width: wp('100%'), backgroundColor: 'lightgray' },
  donationListView: { width: wp('90%'), marginVertical: wp('5%'), alignSelf: 'center' },

  paymentTitleContainer: { backgroundColor: 'white', borderRadius: wp('3.5%'), justifyContent: 'space-between', marginVertical: wp('5%'), shadowOffset: { width: 0, height: 0 }, elevation: 5, shadowColor: Constants.Colors.app_color, shadowOpacity: 0.1, shadowRadius: wp('2%') },
  paymentDetailText: { width: wp('90%'), fontSize: wp('4.2%'), textAlign: 'left', fontFamily: Constants.Fonts.RobotoRegular, alignSelf: 'center', marginVertical: wp('4%') },
  paymentTitleHeaderLine: { height: wp('1.5%'), width: wp('100%'), backgroundColor: Constants.Colors.app_color, alignSelf: 'center' },
  paymentTitleView: { flexDirection: 'row', height: wp('12%'), justifyContent: 'space-between', borderBottomColor: 'gray', borderBottomWidth: 1, alignItems: 'center', paddingHorizontal: wp('5%') },
  paymentTitleText: { fontSize: wp('4.5%'), textAlign: 'left', fontFamily: Constants.Fonts.RobotoMedium, width: wp('70%') },
  methodModalText: { color: 'black', fontSize: wp('4%') },
  donationIcon: { width: wp('7%'), height: wp('7%') },

  donationRowContainer: { width: wp("90%"), display: "flex", flexDirection: "row" },
  donationRowText: { width: wp("35%"), textAlign: "center", fontFamily: Constants.Fonts.RobotoRegular, fontSize: wp("4.2%") }
})

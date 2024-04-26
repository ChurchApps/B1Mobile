import { DimensionHelper } from "@churchapps/mobilehelper";
import { StyleSheet } from "react-native";
import { Constants } from "../helpers";

export const globalStyles = StyleSheet.create({
  //Global Styles
  appContainer: { flex: 1, backgroundColor: Constants.Colors.app_color },
  grayContainer: { flex: 1, backgroundColor: Constants.Colors.gray_bg },
  textInputView: { height: DimensionHelper.wp('12%'), flexDirection: 'row', alignItems: 'center', marginTop: DimensionHelper.wp('5.5%'), marginHorizontal: DimensionHelper.wp('5%'), backgroundColor: 'white', borderRadius: DimensionHelper.wp('2%'), shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: DimensionHelper.wp('1.5%'), elevation: 5,alignSelf:'center' },
  textInputStyle: { height: DimensionHelper.wp('10%'),  fontSize: DimensionHelper.wp('3.8%'), color: 'gray' ,alignItems:'center',justifyContent:'center'},
  roundBlueButton: { height: DimensionHelper.wp('12%'), borderRadius: DimensionHelper.wp('2%'), justifyContent: 'center', alignItems: 'center', alignSelf: 'center', backgroundColor: Constants.Colors.button_bg, marginTop: DimensionHelper.wp('8%') },
  roundBlueButtonText: { color: 'white', fontSize: DimensionHelper.wp('3.8%'), fontFamily: Constants.Fonts.RobotoMedium },
  searchIcon: { width: DimensionHelper.wp('6%'), height: DimensionHelper.wp('6%'), margin: DimensionHelper.wp('1.5%') },
  listTextView: { height: DimensionHelper.wp('12%'), justifyContent: 'space-evenly', width: DimensionHelper.wp('70%') },
  listTitleText: { fontSize: DimensionHelper.wp('4.2%'), fontFamily: Constants.Fonts.RobotoMedium },
  listMainView: { backgroundColor: 'white', alignSelf: 'center', justifyContent: 'flex-start', alignItems: 'center', marginVertical: DimensionHelper.wp('2%'), borderRadius: DimensionHelper.wp('2%'), shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: DimensionHelper.wp('1.5%'), elevation: 5, shadowColor: Constants.Colors.app_color, flexDirection: 'row' },
  listContainerStyle: { marginVertical: DimensionHelper.wp('3%') },
  selectionIcon: { color: 'gray', marginLeft: DimensionHelper.wp('3%') },
  groupListTitle: { fontSize: DimensionHelper.wp('4.5%'), fontFamily: Constants.Fonts.RobotoMedium, color: Constants.Colors.app_color },
  safeAreaContainer: {  alignItems: 'center', justifyContent: 'center' },
  tabStyle: { borderRadius: 10, borderColor: 'transparent', fontSize: 18, margin: 5},
  tabTextStyle: { color: '#818181', fontSize: 18},
  activeTabStyle: { backgroundColor: 'white', borderRadius: 10, borderColor: 'transparent', margin: 5, borderBottomColor:Constants.Colors.Active_TabColor, borderBottomWidth:1},
  activeTabTextStyle: { color: 'black', fontSize: 18 },
  textStyle: { color: 'white', fontSize: 20, fontWeight: '700', marginTop: 40 },
  tabContainerViewStyle: { backgroundColor: 'white', width: '100%', paddingVertical:5, borderRadius: 10},
  loginLinks: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',marginTop:200 },
  simpleLink: { textDecorationLine: "underline", color: Constants.Colors.button_bg },


  //Splash
  // splashImage: { width: DimensionHelper.wp('100%'), height: DimensionHelper.hp('100%') },

  //Login
  inputIcon: { width: DimensionHelper.wp('4.5%'), height: DimensionHelper.wp('4.5%'), margin: DimensionHelper.wp('3%') },
  mainText: { marginHorizontal: DimensionHelper.wp('5%'), marginTop: DimensionHelper.wp('8%'), fontSize: DimensionHelper.wp('4.8%'), fontFamily: Constants.Fonts.RobotoMedium },

  //Church Search
  searchMainText: { marginHorizontal: DimensionHelper.wp('5%'), marginTop: DimensionHelper.wp('8%'), fontSize: DimensionHelper.wp('4.5%'), fontFamily: Constants.Fonts.RobotoLight },
  churchListView: { height: DimensionHelper.wp('16%'), shadowOpacity: 0.1 },
  churchListIcon: { width: DimensionHelper.wp('12%'), height: DimensionHelper.wp('12%'), marginHorizontal: DimensionHelper.wp('2.5%'), borderRadius: DimensionHelper.wp('1.5%') },
  churchListStyle: { marginVertical: DimensionHelper.wp('2%') },
  recentText: { marginHorizontal: DimensionHelper.wp('5%'), marginTop: DimensionHelper.wp('5%'), fontSize: DimensionHelper.wp('4%'), fontFamily: Constants.Fonts.RobotoRegular },

  //Home
  homeContainer: { flex: 1, backgroundColor: 'white' , position:'relative' },
  menuIcon: { width: DimensionHelper.wp('6%'), height: DimensionHelper.wp('6%'), margin: DimensionHelper.wp('5%'), tintColor: 'white'},
  headerText: { color: 'white', textAlign: 'center', fontSize: DimensionHelper.wp('4.5%'), fontWeight: 'bold' },
  TabIndicatorStyle: { backgroundColor: Constants.Colors.white_color, shadowOffset: { height: 0, width: 0 }, shadowColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  text: { color: 'white', fontSize: 20 },
  tabBar: {height: '100%', top: 0   },
  MessagetabView: {position: 'relative', height: '100%', backgroundColor: Constants.Colors.white_color },
  NotificationtabView: {height: '100%', backgroundColor: Constants.Colors.white_color, marginTop : DimensionHelper.hp('2%')},
  activeTabTextColor: {color: Constants.Colors.Active_TabColor ,},
  tabTextColor: {color: Constants.Colors.Dark_Gray , },
  BadgeIconStyle:{ width: DimensionHelper.wp('6%'), height: DimensionHelper.wp('6%')}, 
  BadgemenuIcon: { width: DimensionHelper.wp('6%'), height: DimensionHelper.wp('6%'), marginLeft: DimensionHelper.wp('4%'), tintColor: 'white'},
  BadgeDot:{ position:'absolute', right:25, width:DimensionHelper.wp('2.5%'), height: DimensionHelper.wp('2.5%'),borderRadius: DimensionHelper.wp('1.25%')},
  webViewContainer: { flex: 1, height: "100%", width: "100%" },

  //Service
  groupListView: { height: DimensionHelper.wp('15%'), justifyContent: 'center' },

  //Household
  memberListIcon: { width: DimensionHelper.wp('16%'), height: DimensionHelper.wp('16%'), marginRight: DimensionHelper.wp('1%'), marginVertical: DimensionHelper.wp('2%'), borderRadius: DimensionHelper.wp('1.5%') },
  memberListTextView: { width: DimensionHelper.wp('62%'), marginVertical: DimensionHelper.wp('2%'), justifyContent: 'space-evenly' },
  memberListTitle: { color: Constants.Colors.app_color, marginLeft: DimensionHelper.wp('2%'), width: DimensionHelper.wp('65%') },
  timeIcon: { fontSize: DimensionHelper.wp('5%'), color: Constants.Colors.app_color, marginHorizontal: DimensionHelper.wp('1%') },
  classesView: { flexDirection: 'row', alignSelf: 'center', justifyContent: 'space-between', alignItems: 'center', marginTop: DimensionHelper.wp('2%'), paddingBottom: DimensionHelper.wp('2%'), borderBottomWidth: 1, borderBottomColor: 'lightgray' },
  classesNoneBtn: { width: DimensionHelper.wp('55%'), height: DimensionHelper.wp('16%'), marginHorizontal: DimensionHelper.wp('2%'), alignItems: 'center', justifyContent: 'center', borderRadius: DimensionHelper.wp('2%') },
  classesTimeView: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  classesTimeText: { textAlign: 'center', fontSize: DimensionHelper.wp('3.7%'), color: Constants.Colors.app_color },
  selectedText: { width: DimensionHelper.wp('62%'), textAlign: 'left', fontSize: DimensionHelper.wp('3.4%'), color: Constants.Colors.button_green, marginLeft: DimensionHelper.wp('2%'), marginVertical: DimensionHelper.wp('0.5%') },
  classesNoneText: { width: DimensionHelper.wp('50%'), color: 'white', fontSize: DimensionHelper.wp('3.5%'), textAlign: 'center' },

  //Groups
  groupMainTitle: { marginLeft: DimensionHelper.wp('3%'), width: DimensionHelper.wp('65%') },
  groupView: {flexDirection: 'row', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: DimensionHelper.wp('2%'), paddingBottom: DimensionHelper.wp('2%'), borderBottomWidth: 1, borderBottomColor: 'lightgray' },
  groupBtn: { width: DimensionHelper.wp('75%'), height: DimensionHelper.wp('8%'), alignItems: 'flex-start', justifyContent: 'center' },
  groupText: { color: Constants.Colors.app_color, fontSize: DimensionHelper.wp('4.2%'), marginHorizontal: DimensionHelper.wp('2.5%'), shadowColor: Constants.Colors.app_color,
  shadowOffset: { width: 10, height: 10 },
  shadowOpacity: 1.0,
  shadowRadius: 3,
  elevation: 15, },
  FlatListStyle : { flexGrow:1,  paddingBottom : DimensionHelper.hp('10%')},
  FlatlistViewStyle : {borderRadius : DimensionHelper.hp('0.8%'), paddingBottom: DimensionHelper.hp('3%'), 
  width : DimensionHelper.wp('94%'),  shadowColor :Constants.Colors.Dark_Gray ,shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: DimensionHelper.wp('1.5%'), elevation: 5,
  marginVertical : DimensionHelper.hp('1%'), backgroundColor : Constants.Colors.white_color , alignSelf:'center'},
   
  ImageStyle : {height : '100%', width: '100%' },
  groupImageStyle : { height : '100%' , width : '100%' },
  TitleStyle:{
  backgroundColor:Constants.Colors.app_color,
    alignItems:'center',
    width : '100%',
    borderTopLeftRadius : DimensionHelper.hp('0.8%'),
    borderTopRightRadius : DimensionHelper.hp('0.8%'),
  },
  mainTitleView:{width : '90%' },
  TimeLineTitleView : { marginHorizontal:DimensionHelper.wp('3%'), alignItems:'flex-start', marginVertical : DimensionHelper.hp('1.5%')},
  PostTitleViewStyle : {flexDirection:'row', marginHorizontal : DimensionHelper.wp('1.5%'), marginTop : DimensionHelper.hp('1%')},
  ImageView : {alignItems:'center', justifyContent:'center', width: "100%", height: DimensionHelper.wp(35), marginTop : DimensionHelper.hp('2%') , backgroundColor: "#000000", },
  ImageMainView: { marginHorizontal:DimensionHelper.wp('1.5%')},
  GroupImageView : { marginHorizontal: DimensionHelper.wp('3%')},
  TitleView : { flexDirection: 'row', justifyContent: 'space-between', width: '100%'},
  postTitleView : {flexDirection:'row' ,  marginTop : DimensionHelper.hp('1%') , justifyContent:'space-between'  , marginHorizontal : DimensionHelper.wp('1%'),  },
  TitleTextStyle:{fontSize : DimensionHelper.hp('2%'), color:Constants.Colors.white_color, fontFamily:Constants.Fonts.RobotoMedium},
  eventTextStyle:{fontSize : DimensionHelper.hp('1.6%'), color:'black', fontFamily:Constants.Fonts.RobotoMedium},
  DateTextColor : { fontFamily : Constants.Fonts.RobotoRegular},
  planTextStyle:{ fontSize : DimensionHelper.hp('1.5%'), color:'black', fontFamily:Constants.Fonts.RobotoRegular},
  TaskCreatorColor : { color:Constants.Colors.app_color, fontFamily : Constants.Fonts.RobotoMedium},
  //Complete
  successIcon: { fontSize: DimensionHelper.wp('20%'), color: Constants.Colors.button_green },
  successText: { fontFamily: Constants.Fonts.RobotoLight, fontSize: DimensionHelper.wp('5%'), color: 'black', marginVertical: DimensionHelper.wp('5%') },

  //Member Details
  memberIcon: { width: DimensionHelper.wp('25%'), height: DimensionHelper.wp('25%'), borderRadius: DimensionHelper.wp('12.5%'), alignSelf: 'center', marginTop: DimensionHelper.wp('8%') },
  memberName: { marginHorizontal: DimensionHelper.wp('5%'), marginBottom: DimensionHelper.wp('2%'), fontSize: DimensionHelper.wp('4.8%'), fontFamily: Constants.Fonts.RobotoRegular, alignSelf: 'center', marginTop: DimensionHelper.wp('4%') },
  memberDetailContainer: { marginVertical: DimensionHelper.wp('2%'), backgroundColor: 'white', shadowColor: Constants.Colors.app_color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: DimensionHelper.wp('1%'), elevation: 3, borderRadius: DimensionHelper.wp('1.5%'),alignSelf:'center' },
  detailHeader: { marginVertical: DimensionHelper.wp('2%'), fontSize: DimensionHelper.wp('3.9%'), fontFamily: Constants.Fonts.RobotoLight },
  detailIcon: { width: DimensionHelper.wp('4.8%'), height: DimensionHelper.wp('4.8%'), margin: DimensionHelper.wp('3%'), marginTop: DimensionHelper.wp('2.5%'), marginLeft: DimensionHelper.wp('5%') },
  detailIconContainer: { flexDirection: 'row', alignItems: 'center' },
  detailValue: { marginHorizontal: DimensionHelper.wp('5%'), marginBottom: DimensionHelper.wp('2%'), fontSize: DimensionHelper.wp('4.4%'), fontFamily: Constants.Fonts.RobotoRegular },

  //BlueLogo
  headerContainer: { backgroundColor: Constants.Colors.gray_bg },
  blueLogoView: { borderBottomLeftRadius: DimensionHelper.wp('8%'), borderBottomRightRadius: DimensionHelper.wp('8%'), backgroundColor: Constants.Colors.app_color },
  blueMainIcon: { width: DimensionHelper.wp('55%'), height: DimensionHelper.wp('55%'), margin: DimensionHelper.wp('5%'), resizeMode: 'contain', alignSelf: 'center' },
  blueMainBackIcon: { position: 'absolute', zIndex: 1 },

  //BottomButton
  bottomBtn: { width: DimensionHelper.wp('100%'), height: DimensionHelper.wp('15%'), alignItems: 'center', justifyContent: 'center' },
  classesText: { color: 'white', fontSize: DimensionHelper.wp('4.2%'), marginHorizontal: DimensionHelper.wp('2.5%'), textAlign: 'center' },

  //CustomDrawer
  drawerStyle: { backgroundColor: Constants.Colors.app_color, color: 'white' },
  userIcon: { width: DimensionHelper.wp('6%'), height: DimensionHelper.wp('6%'), margin: DimensionHelper.wp('2%'), borderRadius: DimensionHelper.wp('2%') },
  headerView: { marginLeft: DimensionHelper.wp('5%'), flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  userNameText: { fontSize: DimensionHelper.wp('4%'), fontFamily: Constants.Fonts.RobotoRegular, color: 'white' },
  editProfileText: { fontSize: DimensionHelper.wp('1%'), fontFamily: Constants.Fonts.RobotoRegular, color: 'white' },
  tabIcon: { width: DimensionHelper.wp('6%'), maxHeight: DimensionHelper.wp('10%'), marginVertical: DimensionHelper.wp('2%'), marginHorizontal: DimensionHelper.wp('3%'), color: 'white' },
  tabTitle: { fontSize: DimensionHelper.wp('4%'), fontFamily: Constants.Fonts.RobotoRegular, color: 'white' },
  churchBtn: { borderBottomColor: 'lightgray', borderBottomWidth: 1, marginHorizontal: DimensionHelper.wp('4%'), marginTop: DimensionHelper.wp('6%'), marginBottom: DimensionHelper.wp('2%'), borderRadius: DimensionHelper.wp('1.5%'), flexDirection: 'row', alignItems: 'center', color: 'white' },
  churchText: { fontSize: DimensionHelper.wp('3.7%'), paddingVertical: DimensionHelper.wp('1.5%'), fontFamily: Constants.Fonts.RobotoRegular, marginHorizontal: DimensionHelper.wp('1%'), color: 'white' },
  logoutBtn: { marginTop: DimensionHelper.wp('6%'), marginLeft: DimensionHelper.wp('5%'), color: 'white' },
  messageRootView: {flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'},
  drawerText: { color: 'white' },


  

  //Loader
  indicatorStyle: { position: 'absolute', left: 0, top: 0, backgroundColor: 'rgba(255,255,255,0.5)', width: DimensionHelper.wp('100%'), height: DimensionHelper.hp('100%'), alignItems: 'center', justifyContent: 'center' },

  //MainHeader
  headerViewStyle: { flex: 0, flexDirection: 'row', zIndex: 30, alignItems: 'center', justifyContent: 'space-evenly', backgroundColor: Constants.Colors.app_color },
  componentStyle: { color: Constants.Colors.app_color, alignSelf: 'center', justifyContent: 'center' },

  //WhiteLogo
  headerLogoView: { borderBottomLeftRadius: DimensionHelper.wp('8%'), borderBottomRightRadius: DimensionHelper.wp('8%'), backgroundColor: 'white', shadowColor: Constants.Colors.app_color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: DimensionHelper.wp('1.5%'), elevation: 5 },
  whiteMainIcon: { width: DimensionHelper.wp('55%'), height: DimensionHelper.wp('55%'), marginTop: DimensionHelper.wp('2%'), marginBottom: DimensionHelper.wp('2%'), resizeMode: 'contain', alignSelf: 'center' },
  logoMenuIcon: { width: DimensionHelper.wp('6%'), height: DimensionHelper.wp('6%'), marginLeft: DimensionHelper.wp('5%') },
  logoMenuBtn: { position: 'absolute' },

  //Donate
  dropDownMainStyle: { borderColor: 'lightgray', borderWidth: 1 },
  dropDownStyle: { backgroundColor: 'lightgray', width: DimensionHelper.wp('90%'), borderColor: 'gray', elevation: 999, zIndex: 10 },
  itemStyle: { justifyContent: 'flex-start', borderBottomWidth: 1, borderColor: 'gray', height: DimensionHelper.wp('12.5%'), paddingLeft: DimensionHelper.wp('2%') },
  labelStyle: { fontSize: DimensionHelper.wp('4.2%') },
  containerStyle: { height: DimensionHelper.wp('10%'), width: DimensionHelper.wp('90%'), marginHorizontal: DimensionHelper.wp('5%'), marginTop: DimensionHelper.wp('2%') },
  containerStyleAndroid: { height: DimensionHelper.wp('10%'), width: DimensionHelper.wp('86%'), marginHorizontal: DimensionHelper.wp('5%') },
  dropDownContainer: { height: DimensionHelper.wp('14%'), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: DimensionHelper.wp('5%'), borderRadius: DimensionHelper.wp('3%'), borderColor: 'lightgray', borderWidth: 1 },
  methodContainer: { flexDirection: 'row', width: DimensionHelper.wp('90%'), justifyContent: 'space-between', alignSelf: 'center', marginVertical: DimensionHelper.wp('4%') },
  methodButton: { backgroundColor: 'white', alignSelf: 'center', alignItems: 'center', marginVertical: DimensionHelper.wp('2%'), borderRadius: DimensionHelper.wp('2%'), shadowOffset: { width: 0, height: 0 }, elevation: 5, shadowColor: Constants.Colors.app_color, flexDirection: 'row', height: DimensionHelper.wp('15%'), width: DimensionHelper.wp('42.5%'), justifyContent: 'center', shadowOpacity: 0.3, shadowRadius: DimensionHelper.wp('2%') },
  methodBtnText: { fontFamily: Constants.Fonts.RobotoMedium, color: Constants.Colors.app_color, width: DimensionHelper.wp('40%'), textAlign: 'center', fontSize: DimensionHelper.wp('4.2%') },
  fundView: { width: DimensionHelper.wp('100%'), flexDirection: 'row', justifyContent: 'space-between' },
  fundInput: {color: 'gray',fontFamily : Constants.Fonts.RobotoMedium,  height: DimensionHelper.wp('12%'), width: DimensionHelper.wp('40%'), alignItems: 'center', justifyContent: 'center',   paddingHorizontal: DimensionHelper.wp('2%'), marginLeft: DimensionHelper.wp('5%')   },
  intervalView: { width: DimensionHelper.wp('100%')},
  intervalInput: { fontSize: DimensionHelper.wp('4.2%'), height:DimensionHelper.wp('12%'), width: DimensionHelper.wp('40%'), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'lightgray', borderRadius: DimensionHelper.wp('2%'), paddingHorizontal: DimensionHelper.wp('2%'), marginLeft: DimensionHelper.wp('5%'), marginTop: DimensionHelper.wp('2%') },
  cardDatesView: { width: DimensionHelper.wp('95%'), flexDirection: 'row', justifyContent: "space-around", marginBottom: DimensionHelper.wp("2%") },
  cardDates: { fontSize: DimensionHelper.wp('4.2%'), height: DimensionHelper.wp('12%'), width: DimensionHelper.wp('40%'), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'lightgray', borderRadius: DimensionHelper.wp('2%'), paddingHorizontal: DimensionHelper.wp('2%'), marginLeft: DimensionHelper.wp('5%'), marginTop: DimensionHelper.wp('2%') },
  dateInput: { borderWidth: 1, marginHorizontal: DimensionHelper.wp('5%'), paddingHorizontal: DimensionHelper.wp('2%'), borderColor: 'lightgray', borderRadius: DimensionHelper.wp('2%'), height: DimensionHelper.wp('12%'), marginTop: DimensionHelper.wp('2%'), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1, alignSelf: 'stretch' },
  dateText: { width: DimensionHelper.wp('65%'), fontSize: DimensionHelper.wp('3.8%') },
  notesInputView: { height: DimensionHelper.wp('20%'), alignItems: 'center', justifyContent: 'center', fontSize: DimensionHelper.wp('4.2%'), borderWidth: 1, borderColor: 'lightgray', borderRadius: DimensionHelper.wp('2%'), paddingHorizontal: DimensionHelper.wp('2%'), margin: DimensionHelper.wp('5%'), textAlignVertical: "top" },
  semiTitleText: { marginHorizontal: DimensionHelper.wp('5%'), fontSize: DimensionHelper.wp('4.5%'), fontFamily: Constants.Fonts.RobotoLight, marginTop: DimensionHelper.wp('5%') },
  addMoreText: { color: Constants.Colors.app_color, fontSize: DimensionHelper.wp('4%'), marginHorizontal: DimensionHelper.wp('5%'), marginTop: DimensionHelper.wp('2%') },
  previewBtnView: { flexDirection: 'row', justifyContent: 'space-evenly', width: DimensionHelper.wp('100%'), marginTop: DimensionHelper.wp('2%') },
  previewBtn: { height: DimensionHelper.wp('12%'), width: DimensionHelper.wp('50%'), justifyContent: 'center' },
  previewBtnText: { textAlign: 'center', width: DimensionHelper.wp('50%'), color: 'white', fontSize: DimensionHelper.wp('4.7%'), fontFamily: Constants.Fonts.RobotoMedium },
  actionButtons: { height: DimensionHelper.wp('12%'), width: DimensionHelper.wp('50%'), justifyContent: 'center', alignItems: "center" },
  totalText: { marginHorizontal: DimensionHelper.wp('5%'), fontSize: DimensionHelper.wp('4.5%'), marginTop: DimensionHelper.wp('5%') },
  notesInput: { fontSize: DimensionHelper.wp('4.2%'), width: DimensionHelper.wp('90%'), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'lightgray', borderRadius: DimensionHelper.wp('2%'), paddingHorizontal: DimensionHelper.wp('2%'), marginLeft: DimensionHelper.wp('5%'), marginTop: DimensionHelper.wp('2%'), marginBottom: DimensionHelper.wp("2%") },
  donationContainer: { width: DimensionHelper.wp('100%'), alignItems: 'center', marginVertical: DimensionHelper.wp('2%') },

  previewView: { flexDirection: 'row', paddingVertical: DimensionHelper.wp('3%'), borderBottomWidth: 1, borderBottomColor: 'lightgray' },
  previewTitleText: { width: DimensionHelper.wp('30%'), fontFamily: Constants.Fonts.RobotoRegular, fontSize: DimensionHelper.wp('4.2%') },
  previewDetailText: { width: DimensionHelper.wp('50%'), fontFamily: Constants.Fonts.RobotoRegular, fontSize: DimensionHelper.wp("4.2%") },
  donationPreviewView: { width: '100%', height: DimensionHelper.wp('14%'), marginBottom: DimensionHelper.wp('3%'), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: 'lightgray', borderBottomWidth: 1 },
  donationText: { fontSize: DimensionHelper.wp('5.5%'), fontFamily: Constants.Fonts.RobotoRegular },
  donationCloseBtn: { height: DimensionHelper.wp('8%'), width: DimensionHelper.wp('8%'), justifyContent: 'center' },
  closeIcon: { color: 'gray', alignSelf: 'center' },
  popupBottomContainer: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: DimensionHelper.wp('5%') },
  popupButton: { height: DimensionHelper.wp('12%'), justifyContent: 'center', borderRadius: DimensionHelper.wp('1.5%'), width: DimensionHelper.wp("30%") },
  popupButonText: { textAlign: 'center', color: 'white', fontSize: DimensionHelper.wp('4.7%'), fontFamily: Constants.Fonts.RobotoMedium, paddingHorizontal: DimensionHelper.wp('3%') },

  cardListView: { width: DimensionHelper.wp('90%'), flexDirection: 'row', justifyContent: 'space-between', marginVertical: DimensionHelper.wp('5%'), alignSelf: 'center' },
  cardListText: { fontSize: DimensionHelper.wp('4.2%'), textAlign: 'left', fontFamily: Constants.Fonts.RobotoRegular, alignSelf: 'center' },
  cardListSeperator: { height: 0.5, width: DimensionHelper.wp('100%'), backgroundColor: 'lightgray' },
  donationListView: { width: DimensionHelper.wp('90%'), marginVertical: DimensionHelper.wp('5%'), alignSelf: 'center' },

  paymentTitleContainer: { backgroundColor: 'white', borderRadius: DimensionHelper.wp('3.5%'), justifyContent: 'space-between', marginVertical: DimensionHelper.wp('5%'), shadowOffset: { width: 0, height: 0 }, elevation: 5, shadowColor: Constants.Colors.app_color, shadowOpacity: 0.1, shadowRadius: DimensionHelper.wp('2%') },
  paymentDetailText: { fontSize: DimensionHelper.wp('4.2%'), textAlign: 'left', fontFamily: Constants.Fonts.RobotoRegular, alignSelf: 'center', marginVertical: DimensionHelper.wp('4%'),padding:10},
  paymentTitleHeaderLine: { height: DimensionHelper.wp('1.5%'), backgroundColor: Constants.Colors.app_color, alignSelf: 'center' },
  paymentTitleView: { flexDirection: 'row', height: DimensionHelper.wp('12%'), justifyContent: 'space-between', borderBottomColor: 'gray', borderBottomWidth: 1, alignItems: 'center'},
  paymentTitleText: { fontSize: DimensionHelper.wp('4.5%'), textAlign: 'left', fontFamily: Constants.Fonts.RobotoMedium },
  LatestUpdateTextStyle: { color: 'black', fontSize: DimensionHelper.hp('2%'), fontFamily:Constants.Fonts.RobotoMedium },
  donationIcon: { width: DimensionHelper.wp('7%'), height: DimensionHelper.wp('7%')},

  donationRowContainer: { width: DimensionHelper.wp("90%"), display: "flex", flexDirection: "row" },
  donationRowText: { width: DimensionHelper.wp("35%"), textAlign: "center", fontFamily: Constants.Fonts.RobotoRegular, fontSize: DimensionHelper.wp("4.2%") },
  donationInputFieldContainer : { height: DimensionHelper.wp('12%'), flexDirection: 'row', alignItems: 'center', marginTop: DimensionHelper.wp('5.5%'), marginHorizontal: DimensionHelper.wp('5%'), backgroundColor: 'white', borderRadius: DimensionHelper.wp('2%'), borderColor:"lightgray", borderWidth:1},

  // Message screen
  messageInputContainer: {flexDirection:'row', justifyContent: 'space-between', marginTop: DimensionHelper.wp('2.5%'), marginBottom: DimensionHelper.wp('1%'), alignSelf: 'center', width: DimensionHelper.wp('90%')},
  messageInputStyle: { height: DimensionHelper.wp('10%'), width: DimensionHelper.wp('75%'), borderColor: Constants.Colors.app_color, borderWidth: 1, fontSize: DimensionHelper.wp('3.8%'), color: 'gray', alignItems:'center', justifyContent:'center', paddingHorizontal: DimensionHelper.wp('2%'), paddingVertical: DimensionHelper.wp('1%'), borderRadius: 5},
  sendIcon: {height: DimensionHelper.wp('11%'), width: DimensionHelper.wp('11%'), justifyContent: 'center', alignItems: 'center', borderRadius: 100, borderColor: Constants.Colors.app_color, borderWidth: 2, backgroundColor: Constants.Colors.app_color},
  messageContainer : { flexDirection:'row', justifyContent: 'flex-start', alignItems: 'flex-start', paddingVertical: DimensionHelper.wp('1%'), marginVertical: DimensionHelper.wp('2%') },
  senderNameText : { fontSize:16, fontWeight:'bold', paddingVertical: DimensionHelper.wp('0.5%')},
  messageView : { fontSize : 15, backgroundColor: Constants.Colors.app_color_light, borderWidth:1, borderRadius: 5, borderColor:'transparent', paddingHorizontal : DimensionHelper.wp('2%'), paddingVertical : DimensionHelper.wp("1%"), justifyContent:'center', alignItems: 'flex-start'},

  // My Group Screen
  groupImage: { width: DimensionHelper.wp('92%'), height: DimensionHelper.wp('40%'), borderRadius: DimensionHelper.wp('1.5%')  },
  conversationList: {backgroundColor: 'white', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row', paddingVertical: 12},

//Notification screen
NotificationView:{ marginVertical:DimensionHelper.hp('0.5%'), flexDirection:'row', width : DimensionHelper.wp('94%'), borderRadius: DimensionHelper.wp('2%'),  borderColor: 'lightgray', alignSelf:'center', borderWidth : 1,  alignItems:'center', paddingVertical : DimensionHelper.hp('1%'), paddingRight:DimensionHelper.wp('1%')},
bellIcon: { width: DimensionHelper.wp('6%'), height: DimensionHelper.wp('6%') },
NotificationText : { fontSize:DimensionHelper.hp('1.5%'), color:'black', fontFamily:Constants.Fonts.RobotoMedium},
bellIconView:{ flex:0.1, alignItems:'center' },
notimsgView:{flex:0.8 },
timeSentView:{ flex : 0.1,  alignItems:'flex-end'},
//Planscreen
InputBtnView: { 
  borderRadius:DimensionHelper.wp('1.1%'),
  alignSelf: 'center',
  backgroundColor:Constants.Colors.gray_bg,
  paddingHorizontal: DimensionHelper.wp('3%'),
  paddingVertical:DimensionHelper.hp('1.5%'),
  marginVertical:DimensionHelper.hp('0.5%'),
  flexDirection:'row' , 
  justifyContent:'space-between', 
  alignItems:'center'  
},
InputView : {
  width:DimensionHelper.wp('66%'),    
},
PassInputTextStyle: {
  fontFamily: Constants.Fonts.RobotoMedium,
  color: 'black',
  fontSize: DimensionHelper.hp('1.8%'),
  alignItems: 'flex-start', 
},
ScrollViewStyles:{flexGrow:1, marginBottom: DimensionHelper.hp('5%')},
StatusFont:{ fontFamily:Constants.Fonts.RobotoBold, fontSize : DimensionHelper.hp('1.5%')},
PlanTitleTextStyle : {paddingLeft: DimensionHelper.wp('3%'), color: Constants.Colors.app_color, fontSize: DimensionHelper.hp('2%'), fontFamily:Constants.Fonts.RobotoMedium },
BlockOutDatesView:{ marginHorizontal: DimensionHelper.wp('2%'), marginVertical: DimensionHelper.hp('2%'), flexDirection: 'row', alignItems: 'center', justifyContent:'space-between' },
StatusTextStyle: { fontFamily : Constants.Fonts.RobotoBold, marginLeft : DimensionHelper.wp('2%')},
neededTimeView : {  width : '95%', alignSelf:'center' , marginTop: DimensionHelper.hp('1.5%')},
PlanIconTitleView: {alignItems:'center', justifyContent:'space-between', flexDirection:'row'},
TableHeaderTitle:{ fontSize : DimensionHelper.hp('1.7%'), color:'black', fontFamily:Constants.Fonts.RobotoMedium},
CancelAddbuttonView: { alignItems:'center',  marginVertical: DimensionHelper.hp('2%'), flexDirection: 'row', alignSelf:'flex-end',  },
SaveButtonStyle : {marginLeft: DimensionHelper.wp('3%'),  backgroundColor:Constants.Colors.app_color, borderRadius : DimensionHelper.wp('1.5%'), paddingVertical: DimensionHelper.hp('1%'), paddingHorizontal:DimensionHelper.wp('2%')},
DeleteButtonStyle : {marginLeft: DimensionHelper.wp('3%'), borderWidth : DimensionHelper.wp('0.5%'), borderColor:Constants.Colors.button_red, borderRadius : DimensionHelper.wp('1.5%'), padding: DimensionHelper.wp('1.5%')},
ButtonTextStyle: { color:'black', fontFamily:Constants.Fonts.RobotoMedium, fontSize:DimensionHelper.wp('3%'), },
planTitleView: { marginLeft: DimensionHelper.wp('2%'), marginVertical : DimensionHelper.hp('2%'), flexDirection:'row' , alignItems:'center', },
statusView: { marginHorizontal: DimensionHelper.wp('2%'),  flexDirection:'row' , alignItems:'center', padding : DimensionHelper.hp('1.5%') },
BorderSeparatorView: { width : '98%', flexDirection: 'row', alignSelf: 'center', justifyContent: 'space-between', alignItems: 'center', marginTop: DimensionHelper.wp('0.5%'),  borderBottomWidth: 1, borderBottomColor: 'lightgray' },
})

import { StyleSheet } from "react-native";
import Colors from "../utils/Colors";
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Fonts from "../utils/Fonts";

const globalStyles = StyleSheet.create({
    appContainer: {
        flex: 1,
        backgroundColor: Colors.app_color
    },
    grayContainer: {
        flex: 1,
        backgroundColor: Colors.gray_bg
    },
    textInputView: {
        height: wp('12%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: wp('5.5%'),
        marginHorizontal: wp('5%'),
        backgroundColor: 'white',
        borderRadius: wp('2%'),
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: wp('1.5%'),
        elevation: 5,
    },
    textInputStyle: {
        height: wp('10%'),
        width: wp('80%'),
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: wp('3.8%'),
        color: 'gray',
    },
    roundBlueButton: {
        height: wp('12%'),
        width: wp('90%'),
        borderRadius: wp('2%'),
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: Colors.button_bg,
        marginTop: wp('8%'),
    },
    roundBlueButtonText: {
        color: 'white',
        fontSize: wp('3.8%'),
        fontFamily: Fonts.RobotoMedium
    },
    searchIcon: {
        width: wp('6%'),
        height: wp('6%'),
        margin: wp('1.5%'),
    },
    listTextView: {
        height: wp('12%'),
        justifyContent: 'space-evenly'
    },
    listTitleText: {
        fontSize: wp('4.2%'),
        fontFamily: Fonts.RobotoMedium
    },
    listMainView: {
        width: wp('90%'),
        backgroundColor: 'white',
        alignSelf: 'center',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: wp('2%'),
        borderRadius: wp('2%'),
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: wp('1.5%'),
        elevation: 5,
        shadowColor: Colors.app_color,
        flexDirection: 'row'
    },
    listContainerStyle: {
        marginVertical: wp('3%'),
    },
    selectionIcon: {
        fontSize: wp('6%'),
        color: 'gray',
        marginLeft: wp('3%')
    },
    groupListTitle: {
        fontSize: wp('4.5%'),
        fontFamily: Fonts.RobotoMedium,
        color: Colors.app_color,
    },
})

export default globalStyles;
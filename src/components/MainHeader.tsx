import React from 'react';
import { 
    View, 
    Platform } from 'react-native';
import { StyleSheet } from 'react-native';
import { 
    widthPercentageToDP as wp 
} from 'react-native-responsive-screen';
import Colors from '../utils/Colors';

interface Props {
    leftComponent: any;
    mainComponent: any;
    rightComponent: any;
}

const MainHeader = (props: Props) => {
    return (
        <View style={styles.headerViewStyle}>
            <View style={[styles.componentStyle, {
                flex: 2.1, justifyContent: 'flex-start'
            }]}>{props.leftComponent}</View>
            <View style={[styles.componentStyle, {
                flex: 5.5,
            }]}>{props.mainComponent}</View>
            <View style={[styles.componentStyle, {
                flex: 2, justifyContent: 'flex-end'
            }]}>{props.rightComponent}</View>
        </View>
    );
};


const styles = StyleSheet.create({
    headerViewStyle: {
        flex: 0,
        flexDirection: 'row',
        zIndex: 30,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingTop:Platform.OS === 'ios' ? 0 : wp('4.5%'),
        backgroundColor: Colors.app_color
    },
    componentStyle: {
        color: Colors.app_color,
        alignSelf: 'center',
        justifyContent: 'center'
    },
})


export default MainHeader;

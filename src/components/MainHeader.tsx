import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native';
import Colors from '../utils/Colors';

interface Props {
    leftComponent: any;
    mainComponent: any;
    rightComponent: any;
}

const MainHeader = (props: Props) => {
    return (
        <View style={styles.headerViewStyle}>
            <View style={[styles.componentStyle, { flex: 2.1, justifyContent: 'flex-start' }]}>{props.leftComponent}</View>
            <View style={[styles.componentStyle, { flex: 5.5 }]}>{props.mainComponent}</View>
            <View style={[styles.componentStyle, { flex: 2, justifyContent: 'flex-end' }]}>{props.rightComponent}</View>
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
        backgroundColor: Colors.app_color
    },
    componentStyle: {
        color: Colors.app_color,
        alignSelf: 'center',
        justifyContent: 'center'
    },
})

export default MainHeader;
import React from 'react';
import { View } from 'react-native';
import globalStyles from '../helper/GlobalStyles';

interface Props {
    leftComponent: any;
    mainComponent: any;
    rightComponent: any;
}

const MainHeader = (props: Props) => {
    return (
        <View style={globalStyles.headerViewStyle}>
            <View style={[globalStyles.componentStyle, { flex: 2.1, justifyContent: 'flex-start' }]}>{props.leftComponent}</View>
            <View style={[globalStyles.componentStyle, { flex: 5.5 }]}>{props.mainComponent}</View>
            <View style={[globalStyles.componentStyle, { flex: 2, justifyContent: 'flex-end' }]}>{props.rightComponent}</View>
        </View>
    );
};

export default MainHeader;
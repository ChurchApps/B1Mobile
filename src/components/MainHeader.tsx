import * as React from 'react';
import { View } from 'react-native';
import globalStyles from '../helper/GlobalStyles';

interface Props {
    leftComponent: any;
    mainComponent: any;
    rightComponent: any;
}

export function MainHeader({ leftComponent, mainComponent, rightComponent }: Props) {
    return (
        <View style={globalStyles.headerViewStyle}>
            <View style={[globalStyles.componentStyle, { flex: 2.1, justifyContent: 'flex-start' }]}>{leftComponent}</View>
            <View style={[globalStyles.componentStyle, { flex: 5.5 }]}>{mainComponent}</View>
            <View style={[globalStyles.componentStyle, { flex: 2, justifyContent: 'flex-end' }]}>{rightComponent}</View>
        </View>
    );
};

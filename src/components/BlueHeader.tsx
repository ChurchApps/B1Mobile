import React from 'react';
import { Image, View } from 'react-native';
import globalStyles from '../helper/GlobalStyles';
import Images from '../utils/Images';

const BlueHeader = (props: {}) => {
    return (
        <View style={globalStyles.headerContainer}>
            <View style={globalStyles.blueLogoView}>
                <Image source={Images.logoWhite} style={globalStyles.blueMainIcon} />
            </View>
        </View>
    );
};

export default BlueHeader;
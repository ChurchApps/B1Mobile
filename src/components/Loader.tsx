import React from 'react';
import { 
    ActivityIndicator} from 'react-native';
import { StyleSheet } from 'react-native';
import { 
    widthPercentageToDP as wp,
    heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import Colors from '../utils/Colors';

interface Props {
    loading: any;
}

const Loader = (props: Props) => {
    return (
        <ActivityIndicator style={styles.activityStyle} size='large' animating={props.loading} />
    );
};

const styles = StyleSheet.create({
    activityStyle: {
        position: 'absolute',
        left: 0,
        top: 0,
        backgroundColor: 'white',
        width:wp('100%'),
        height:hp('100%'),
        alignItems:'center',
        justifyContent: 'center'
    }
})


export default Loader;

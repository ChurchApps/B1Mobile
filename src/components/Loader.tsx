import React from 'react';
import { ActivityIndicator} from 'react-native';
import globalStyles from '../helper/GlobalStyles';

interface Props {
    loading: any;
}

const Loader = (props: Props) => {
    return (
        <ActivityIndicator style={globalStyles.indicatorStyle} size='large' color='gray' animating={props.loading} />
    );
};

export default Loader;
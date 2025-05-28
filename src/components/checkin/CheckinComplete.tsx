import { Constants, UserHelper, globalStyles } from '@/src/helpers';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';


interface Props {
  onDone: () => void
}

export const CheckinComplete = (props: Props) => {

  useEffect(() => {
    UserHelper.addOpenScreenEvent('CheckinCompleteScreen');
    setTimeout(() => { props.onDone() }, 1500);
  }, []);


  return (
    <View style={[globalStyles.safeAreaContainer, { flex: 1, backgroundColor: Constants.Colors.app_color }]}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="check-circle" size={DimensionHelper.wp(20)} color="green" />
        <Text style={{ fontSize: DimensionHelper.wp(5), marginTop: DimensionHelper.wp(2), color: 'white' }}>Check-in Complete!</Text>
      </View>
    </View>
  );
};

import { UserHelper, globalStyles } from '@/src/helpers';
import { DimensionHelper } from '@churchapps/mobilehelper';
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
    <View>
      <Icon name={'check-circle'} style={{ ...globalStyles.successIcon, marginLeft: "auto", marginRight: "auto" }} size={DimensionHelper.wp('20%')} />
      <Text style={{ ...globalStyles.successText, textAlign: "center" }}>Checkin Complete.</Text>
    </View>
  );
};

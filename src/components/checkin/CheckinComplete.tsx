import { DimensionHelper } from '@churchapps/mobilehelper';
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { UserHelper, globalStyles } from '../../helpers';

interface Props {
  onDone: () => void
}

export const CheckinComplete = (props: Props) => {
  
  useEffect(() => {
    UserHelper.addOpenScreenEvent('CheckinCompleteScreen');
    setTimeout(() => { props.onDone() }, 1000);
  }, []);


  return (
    <>
      <Icon name={'check-circle'} style={globalStyles.successIcon} size={DimensionHelper.wp('20%')} />
      <Text style={globalStyles.successText}>Checkin Complete.</Text>
    </>
  );
};

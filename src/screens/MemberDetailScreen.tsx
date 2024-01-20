import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, Linking, PixelRatio, SafeAreaView, Text, View } from 'react-native';
import { FlatList, ScrollView, TouchableOpacity, } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/Zocial';
import { Loader, MainHeader } from '../components';
import { ApiHelper, Constants, EnvironmentHelper, UserHelper, Utilities, globalStyles } from '../helpers';
import { NavigationProps } from '../interfaces';

interface Props {
  navigation: NavigationProps;
  route: {
    params: {
      member: any,
    }
  };
}

export const MemberDetailScreen = (props: Props) => {
  const member = props.route.params.member;
  const memberinfo = member.contactInfo;
  const [isLoading, setLoading] = useState(false);
  const [householdList, setHouseholdList] = useState([]);
  const scrollViewRef = useRef<any>();
  const [dimension, setDimension] = useState(Dimensions.get('screen'));

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
  };

  useEffect(() => {
    Utilities.trackEvent("Member Detail Screen");
    getHouseholdMembersList();
    UserHelper.addOpenScreenEvent('MemberDetailScreen');
    Dimensions.addEventListener('change', () => { const dim = Dimensions.get('screen'); setDimension(dim); });
  }, [props.route.params])

  useEffect(() => {
  }, [dimension])


  const onEmailClick = (email: string) => {
    if (email) Linking.openURL(`mailto:${email}`)
    else Alert.alert("Sorry", 'Email of this user is not available.');
  }

  const onPhoneClick = (phone: any) => {
    if (phone) Linking.openURL(`tel:${phone}`)
    else Alert.alert("Sorry", 'Phone number of this user is not available.');
  }
  const onAddressClick = () => {
    if (memberinfo.address1) Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${memberinfo.address1}`);
    else Alert.alert("Sorry", 'Address of this user is not available.');
  }

  const getHouseholdMembersList = async () => {
    setLoading(true);
    const householdId = member.householdId;
    ApiHelper.get("/people/household/" + householdId, "MembershipApi").then(data => {
      setLoading(false);
      setHouseholdList(data);
    })
  }

  const onMembersClick = (item: any) => {
    scrollViewRef.current.scrollTo({ y: 0, animated: false })
    props.navigation.navigate('MemberDetailScreen', { member: item })
  }

  const renderMemberItem = (item: any) => {
    return (
      <TouchableOpacity style={[globalStyles.listMainView, { width: wd('90%') }]} onPress={() => onMembersClick(item)}>
        <Image source={item.photo ? { uri: EnvironmentHelper.ContentRoot + item.photo } : Constants.Images.ic_member} style={globalStyles.memberListIcon} />
        <View style={globalStyles.listTextView}>
          <Text style={globalStyles.listTitleText} numberOfLines={1}>{item.name.display}</Text>
        </View>
      </TouchableOpacity>
    );
  }


  return (
    <SafeAreaView style={globalStyles.grayContainer}>
      <MainHeader title="Directory" openDrawer={props.navigation.openDrawer} />
      <ScrollView style={globalStyles.grayContainer} ref={scrollViewRef}>
        <Image source={member.photo ? { uri: EnvironmentHelper.ContentRoot + member.photo } : Constants.Images.ic_member} style={globalStyles.memberIcon} />
        <Text style={globalStyles.memberName}>{member.name.display}</Text>

        <TouchableOpacity style={[globalStyles.memberDetailContainer, { width: wd('90%') }]} onPress={() => onEmailClick(memberinfo.email)}>
          <View style={globalStyles.detailIconContainer}>
            <Icon name={'email'} color={Constants.Colors.app_color} style={globalStyles.detailIcon} size={wp('4.8%')} />
            <Text style={globalStyles.detailHeader}>Email :</Text>
          </View>
          <Text style={globalStyles.detailValue}>{memberinfo.email ? memberinfo.email : '-'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[globalStyles.memberDetailContainer, { width: wd('90%') }]} onPress={() => onPhoneClick(memberinfo.homePhone)}>
          <View style={globalStyles.detailIconContainer}>
            <FontAwesome5 name={'phone-alt'} color={Constants.Colors.app_color} style={globalStyles.detailIcon} size={wp('4.8%')} />
            <Text style={globalStyles.detailHeader}>Phone :</Text>
          </View>
          <Text style={globalStyles.detailValue}>{memberinfo.homePhone ? memberinfo.homePhone : '-'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[globalStyles.memberDetailContainer, { width: wd('90%') }]} onPress={() => onAddressClick()}>
          <View style={globalStyles.detailIconContainer}>
            <FontAwesome5 name={'location-arrow'} color={Constants.Colors.app_color} style={globalStyles.detailIcon} size={wp('4.8%')} />
            <Text style={globalStyles.detailHeader}>Address :</Text>
          </View>
          {memberinfo.address1 ? <Text style={globalStyles.detailValue}>{memberinfo.address1}</Text> : null}
          {memberinfo.address2 ? <Text style={globalStyles.detailValue}>{memberinfo.address2}</Text> : null}
          <Text style={globalStyles.detailValue}>{memberinfo.city ? memberinfo.city + ',' : ''} {memberinfo.state ? memberinfo.state + '-' : ''} {memberinfo.zip}</Text>
        </TouchableOpacity>

        <Text style={[globalStyles.searchMainText, { alignSelf: 'center' }]}>- Household Members -</Text>
        <FlatList data={householdList} renderItem={({ item }) => renderMemberItem(item)} keyExtractor={(item: any) => item.id} style={globalStyles.listContainerStyle} />
      </ScrollView>
      {isLoading && <Loader isLoading={isLoading} />}
    </SafeAreaView>
  );
};

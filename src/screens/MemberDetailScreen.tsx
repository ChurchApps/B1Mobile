import { DimensionHelper } from '@churchapps/mobilehelper';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Linking, SafeAreaView, Text, View } from 'react-native';
import { FlatList, ScrollView, TouchableOpacity, } from 'react-native-gesture-handler';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome';
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

const phoneTypes = [
  { key: 'mobilePhone', label: 'Mobile' },
  { key: 'homePhone', label: 'Home' },
  { key: 'workPhone', label: 'Work' },
];

export const MemberDetailScreen = (props: Props) => {
  const member = props.route.params.member;
  const memberinfo = member.contactInfo;
  const [isLoading, setLoading] = useState(false);
  const [householdList, setHouseholdList] = useState([]);
  const scrollViewRef = useRef<any>();

  const validPhones = phoneTypes.filter(({ key }) => memberinfo[key]);


  useEffect(() => {
    Utilities.trackEvent("Member Detail Screen");
    getHouseholdMembersList();
    UserHelper.addOpenScreenEvent('MemberDetailScreen');
  }, [props.route.params])

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
      <TouchableOpacity style={[globalStyles.listMainView, { width: DimensionHelper.wp('90%') }]} onPress={() => onMembersClick(item)}>
        <Image source={item.photo ? { uri: EnvironmentHelper.ContentRoot + item.photo } : Constants.Images.ic_member} style={globalStyles.memberListIcon} />
        <View style={globalStyles.listTextView}>
          <Text style={globalStyles.listTitleText} numberOfLines={1}>{item.name.display}</Text>
        </View>
      </TouchableOpacity>
    );
  }


  return (
    <SafeAreaView style={globalStyles.grayContainer}>
      <MainHeader title="Directory" openDrawer={props.navigation.openDrawer} back={props.navigation.goBack} />
      <ScrollView style={globalStyles.grayContainer} ref={scrollViewRef}>
        <Image source={member.photo ? { uri: EnvironmentHelper.ContentRoot + member.photo } : Constants.Images.ic_member} style={globalStyles.memberIcon} />
        {/* <Text style={globalStyles.memberName}>{member.name.display}</Text> */}
        <View style={globalStyles.nameMsgContainer}>
          <Text style={globalStyles.memberName}>{member.name.display}</Text>
          <TouchableOpacity style={globalStyles.msgButtonContainer}
            onPress={() => props.navigation.navigate('MessagesScreen', { userDetails: member })}
          >
            <Text style={globalStyles.msgText}>MESSAGE</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[globalStyles.memberDetailContainer, { width: DimensionHelper.wp('90%') }]} onPress={() => onEmailClick(memberinfo.email)}>
          <View style={globalStyles.detailIconContainer}>
            <Icon name={'email'} color={Constants.Colors.app_color} style={globalStyles.detailIcon} size={DimensionHelper.wp('4.8%')} />
            <Text style={globalStyles.detailHeader}>Email :</Text>
          </View>
          <Text style={globalStyles.detailValue}>{memberinfo.email ? memberinfo.email : '-'}</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={[globalStyles.memberDetailContainer, { width: DimensionHelper.wp('90%') }]} onPress={() => onPhoneClick(memberinfo.homePhone)}>
          <View style={globalStyles.detailIconContainer}>
            <FontAwesome5 name={'phone'} color={Constants.Colors.app_color} style={globalStyles.detailIcon} size={DimensionHelper.wp('4.8%')} />
            <Text style={globalStyles.detailHeader}>Phone :</Text>
          </View>
          <Text style={globalStyles.detailValue}>{memberinfo.homePhone ? memberinfo.homePhone : '-'}</Text>
        </TouchableOpacity> */}
        {validPhones.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[globalStyles.memberDetailContainer, { width: DimensionHelper.wp('90%') }]}
            onPress={() => onPhoneClick(memberinfo[key])}
          >
            <View style={globalStyles.detailIconContainer}>
              <FontAwesome5
                name={'phone'}
                color={Constants.Colors.app_color}
                style={globalStyles.detailIcon}
                size={DimensionHelper.wp('4.8%')}
              />
              <Text style={globalStyles.detailHeader}>{label} :</Text>
            </View>
            <Text style={globalStyles.detailValue}>{memberinfo[key]}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[globalStyles.memberDetailContainer, { width: DimensionHelper.wp('90%') }]} onPress={() => onAddressClick()}>
          <View style={globalStyles.detailIconContainer}>
            <FontAwesome5 name={'location-arrow'} color={Constants.Colors.app_color} style={globalStyles.detailIcon} size={DimensionHelper.wp('4.8%')} />
            <Text style={globalStyles.detailHeader}>Address :</Text>
          </View>
          {memberinfo.address1 ? <Text style={globalStyles.detailValue}>{memberinfo.address1}</Text> : null}
          {memberinfo.address2 ? <Text style={globalStyles.detailValue}>{memberinfo.address2}</Text> : null}
          <Text style={globalStyles.detailValue}>{memberinfo.city ? memberinfo.city + ',' : ''} {memberinfo.state ? memberinfo.state + '-' : ''} {memberinfo.zip}</Text>
        </TouchableOpacity>

        <Text style={[globalStyles.searchMainText, { alignSelf: 'center' }]}>- Household Members -</Text>
        <FlatList data={householdList} renderItem={({ item }) => renderMemberItem(item)} keyExtractor={(item: any) => item.id} style={globalStyles.listContainerStyle} scrollEnabled={false} />
      </ScrollView>
      {isLoading && <Loader isLoading={isLoading} />}
    </SafeAreaView>
  );
};

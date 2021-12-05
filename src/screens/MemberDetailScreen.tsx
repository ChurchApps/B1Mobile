import React, { useState, useEffect, useRef } from 'react';
import { View, SafeAreaView, Image, Text, Alert, Linking } from 'react-native';
import { FlatList, ScrollView, TouchableOpacity, } from 'react-native-gesture-handler';
import Images from '../utils/Images';
import { globalStyles } from '../helpers';
import { BlueHeader, Loader } from '../components';
import API from '../helpers/ApiConstants';
import Icon from 'react-native-vector-icons/Zocial';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from '../utils/Colors';
import { connect } from 'react-redux';
import { getHouseholdList } from '../redux/actions/householdListAction';
import { getToken } from '../helpers/_ApiHelper';

interface Props {
  navigation: {
    navigate: (screenName: string, params: any) => void;
    goBack: () => void;
    openDrawer: () => void;
  };
  route: {
    params: {
      member: any,
    }
  };
  getHouseholdListApi: (householdId: any, token: any, callback: any) => void;
}

const MemberDetailScreen = (props: Props) => {
  const { navigate, goBack, openDrawer } = props.navigation;
  const member = props.route.params.member;
  const memberinfo = member.contactInfo;
  const [isLoading, setLoading] = useState(false);
  const [householdList, setHouseholdList] = useState([]);
  const scrollViewRef = useRef<any>();

  useEffect(() => {
    getHouseholdMembersList();
  }, [props.route.params])

  const onEmailClick = (email: string) => {
    if (email) {
      Linking.openURL(`mailto:${email}`)
    } else {
      Alert.alert("Sorry", 'Email of this user is not available.');
    }
  }

  const onPhoneClick = (phone: any) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`)
    } else {
      Alert.alert("Sorry", 'Phone number of this user is not available.');
    }
  }

  const onAddressClick = () => {
    if (memberinfo.address1) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${memberinfo.address1}`);
    } else {
      Alert.alert("Sorry", 'Address of this user is not available.');
    }
  }

  const getHouseholdMembersList = async () => {
    setLoading(true);
    const householdId = member.householdId;
    const token = await getToken('default');
    props.getHouseholdListApi(householdId, token, (err: any, res: any) => {
      setLoading(false);
      if (!err) {
        if (res.data) { setHouseholdList(res.data) }
      } else {
        Alert.alert("Alert", err.message);
      }
    });
  }

  const onMembersClick = (item: any) => {
    scrollViewRef.current.scrollTo({ y: 0, animated: false })
    navigate('MemberDetailScreen', { member: item })
  }

  const renderMemberItem = (item: any) => {
    return (
      <TouchableOpacity style={globalStyles.listMainView} onPress={() => onMembersClick(item)}>
        <Image source={item.photo ? { uri: API.IMAGE_URL + item.photo } : Images.ic_member} style={globalStyles.memberListIcon} />
        <View style={globalStyles.listTextView}>
          <Text style={globalStyles.listTitleText} numberOfLines={1}>{item.name.display}</Text>
        </View>
      </TouchableOpacity>
    );
  }


  return (
    <SafeAreaView style={globalStyles.appContainer}>
      <BlueHeader />
      <ScrollView style={globalStyles.grayContainer} ref={scrollViewRef}>
        <Image source={member.photo ? { uri: API.IMAGE_URL + member.photo } : Images.ic_member} style={globalStyles.memberIcon} />
        <Text style={globalStyles.memberName}>{member.name.display}</Text>

        <TouchableOpacity style={globalStyles.memberDetailContainer} onPress={() => onEmailClick(memberinfo.email)}>
          <View style={globalStyles.detailIconContainer}>
            <Icon name={'email'} color={Colors.app_color} style={globalStyles.detailIcon} size={wp('4.8%')} />
            <Text style={globalStyles.detailHeader}>Email :</Text>
          </View>
          <Text style={globalStyles.detailValue}>{memberinfo.email ? memberinfo.email : '-'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.memberDetailContainer} onPress={() => onPhoneClick(memberinfo.homePhone)}>
          <View style={globalStyles.detailIconContainer}>
            <FontAwesome5 name={'phone-alt'} color={Colors.app_color} style={globalStyles.detailIcon} size={wp('4.8%')} />
            <Text style={globalStyles.detailHeader}>Phone :</Text>
          </View>
          <Text style={globalStyles.detailValue}>{memberinfo.homePhone ? memberinfo.homePhone : '-'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.memberDetailContainer} onPress={() => onAddressClick()}>
          <View style={globalStyles.detailIconContainer}>
            <FontAwesome5 name={'location-arrow'} color={Colors.app_color} style={globalStyles.detailIcon} size={wp('4.8%')} />
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

const mapStateToProps = (state: any) => {
  return {
    household_list: state.household_list,
  };
};
const mapDispatchToProps = (dispatch: any) => {
  return {
    getHouseholdListApi: (householdId: any, token: any, callback: any) => dispatch(getHouseholdList(householdId, token, callback)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberDetailScreen);
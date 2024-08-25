import { DimensionHelper } from '@churchapps/mobilehelper';
import React, { useEffect, useState } from 'react';
import { Alert, Image, SafeAreaView, Text, TextInput, View } from 'react-native';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { Loader, MainHeader } from '../components';
import { ApiHelper, Constants, EnvironmentHelper, UserHelper, Utilities, globalStyles } from '../helpers';
import { NavigationProps } from '../interfaces';

interface Props {
  navigation: NavigationProps;
}

export const MembersSearch = (props: Props) => {
  const [searchText, setSearchText] = useState('');
  const [searchList, setSearchList] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    console.log("LOADED MEMBERS")
    Utilities.trackEvent("Member Search Screen");
    loadMembers()
    UserHelper.addOpenScreenEvent('MembersSearch');
  }, [])

  const loadMembers = () => {
    ApiHelper.get("/people", "MembershipApi").then(data => {
      setLoading(false);
      setSearchList(data);
      setMembersList(data);
      if (data.length === 0) Alert.alert("Alert", "No matches found");
    })
  }

  const filterMember = (searchText: string) => {
    let filterList = membersList.filter((item: any) => {
      if (item.name.display.toLowerCase().match(searchText.toLowerCase())) { return item }
    })
    if (searchText != '') setSearchList(filterList)
    else setSearchList(membersList)
  }

  const renderMemberItem = (item: any) => {
    return (
      <TouchableOpacity style={[globalStyles.listMainView, { width: DimensionHelper.wp('90%') }]} onPress={() => { props.navigation.navigate('MemberDetailScreen', { member: item }) }}>
        <Image source={item.photo ? { uri: EnvironmentHelper.ContentRoot + item.photo } : Constants.Images.ic_member} style={globalStyles.memberListIcon} />
        <View style={globalStyles.listTextView}>
          <Text style={globalStyles.listTitleText}>{item.name.display}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const getResults = () => {
    if (isLoading) return <></>
    else if (searchList.length == 0) return <Text style={globalStyles.recentText}>No results found</Text>
    else return <FlatList data={searchList} renderItem={({ item }) => renderMemberItem(item)} keyExtractor={(item: any) => item.id} style={globalStyles.churchListStyle}/>
  }

  return (
    <SafeAreaView style={[globalStyles.grayContainer,{alignSelf:'center'}]}>
      <MainHeader title="Directory" openDrawer={props.navigation.openDrawer} back={props.navigation.goBack}/>
      <View style={{ width: DimensionHelper.wp(100), flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        
          <Text style={[globalStyles.searchMainText, { marginHorizontal: DimensionHelper.wp('5%') }]}>Find Members</Text>
          <View style={[globalStyles.textInputView, { width: DimensionHelper.wp('90%') }]}>
            <Image source={Constants.Images.ic_search} style={globalStyles.searchIcon} />
            <TextInput style={[globalStyles.textInputStyle, { width: DimensionHelper.wp('90%') }]} placeholder={'Member Name'} autoCapitalize="none" autoCorrect={false} keyboardType='default' placeholderTextColor={'lightgray'} value={searchText} onChangeText={(text) => { setSearchText(text) }} />

          </View>
          <TouchableOpacity style={[globalStyles.roundBlueButton, { marginTop: DimensionHelper.wp('6%'), width: DimensionHelper.wp('90%') }]} onPress={() => filterMember(searchText)}>
            <Text style={globalStyles.roundBlueButtonText}>SEARCH</Text>
          </TouchableOpacity>
       
            {getResults()}
        
        {isLoading && <Loader isLoading={isLoading} />}
       
      </View>
    </SafeAreaView>
  );
};


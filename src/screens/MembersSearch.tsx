import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Image, Text, Alert } from 'react-native';
import { FlatList, ScrollView, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ApiHelper, Constants, EnvironmentHelper, Utilities } from '../helpers';
import { globalStyles } from '../helpers';
import { BlueHeader, Loader, SimpleHeader, WhiteHeader } from '../components';

interface Props {
  navigation: {
    navigate: (screenName: string, params: any) => void;
    goBack: () => void;
    openDrawer: () => void;
  };
}

export const MembersSearch = (props: Props) => {
  const { navigate, goBack, openDrawer } = props.navigation;
  const [searchText, setSearchText] = useState('');
  const [searchList, setSearchList] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    Utilities.trackEvent("Member Search Screen");
    loadMembers()
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
    if (searchText != '') {
      setSearchList(filterList)
    } else {
      setSearchList(membersList)
    }
  }

  const renderMemberItem = (item: any) => {
    return (
      <TouchableOpacity style={globalStyles.listMainView} onPress={() => { navigate('MemberDetailScreen', { member: item }) }}>
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
    else return <FlatList data={searchList} renderItem={({ item }) => renderMemberItem(item)} keyExtractor={(item: any) => item.id} style={globalStyles.churchListStyle} />
  }

  return (
    <SafeAreaView style={globalStyles.grayContainer}>
      <SimpleHeader onPress={() => openDrawer()} title="Directory" />
      <ScrollView style={globalStyles.grayContainer}>
        <Text style={globalStyles.searchMainText}>Find Members</Text>
        <View style={globalStyles.textInputView}>
          <Image source={Constants.Images.ic_search} style={globalStyles.searchIcon} />
          <TextInput style={globalStyles.textInputStyle} placeholder={'Member Name'} autoCapitalize="none" autoCorrect={false} keyboardType='default' placeholderTextColor={'lightgray'} value={searchText} onChangeText={(text) => { setSearchText(text) }} />
        </View>
        <TouchableOpacity style={{ ...globalStyles.roundBlueButton, marginTop: wp('6%') }} onPress={() => filterMember(searchText)}>
          <Text style={globalStyles.roundBlueButtonText}>SEARCH</Text>
        </TouchableOpacity>
        {getResults()}
      </ScrollView>
      {isLoading && <Loader isLoading={isLoading} />}
    </SafeAreaView>
  );
};


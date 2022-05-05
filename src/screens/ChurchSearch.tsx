import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Image, Text, ActivityIndicator, Alert, DevSettings, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { FlatList, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ApiHelper, ArrayHelper, ChurchInterface, Constants } from '../helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles, UserHelper } from '../helpers';
import { BlueHeader } from '../components';
import RNRestart from 'react-native-restart';

interface Props {
  navigation: {
    navigate: (screenName: string) => void;
    goBack: () => void;
    openDrawer: () => void;
  };
}

export const ChurchSearch = (props: Props) => {
  const [searchText, setSearchText] = useState('');
  const [searchList, setSearchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentList, setRecentList] = useState([]);
  const [recentListEmpty, setRecentListEmpty] = useState(false);

  useEffect(() => {
    GetRecentList();
  }, [])

  const churchSelection = async (churchData: ChurchInterface) => {
    StoreToRecent(churchData);
    try {
      const existing = (UserHelper.churches) ? ArrayHelper.getOne(UserHelper.churches, "id", churchData.id) : null;
      if (existing) churchData = existing;
      const churchValue = JSON.stringify(churchData);
      await AsyncStorage.setItem('CHURCH_DATA', churchValue)
      await UserHelper.setCurrentChurch(churchData);
      if (UserHelper.user) UserHelper.setPersonRecord();
      //DevSettings.reload()
      RNRestart.Restart();
    } catch (err) {
      console.log(err)
    }
  }

  const searchApiCall = (text: String) => {
    setLoading(true);
    ApiHelper.getAnonymous("/churches/search/?name=" + text + "&app=B1&include=logoSquare", "AccessApi").then(data => {
      setLoading(false);
      setSearchList(data);
      if (data.length === 0) Alert.alert("Alert", "No matches found");
    })
  }

  const GetRecentList = async () => {
    try {
      const church_list = await AsyncStorage.getItem('RECENT_CHURCHES');
      if (church_list != null) {
        setRecentListEmpty(true)
        let list = JSON.parse(church_list);
        let reverseList = list.reverse()
        setRecentList(reverseList);
      }
    } catch (err) {
      console.log('GET RECENT CHURCHES ERROR', err)
    }
  }

  const StoreToRecent = async (churchData: any) => {
    var filteredItems: any[] = [];
    filteredItems = recentList.filter((item: any) => item.id !== churchData.id);
    filteredItems.push(churchData);
    try {
      const churchlist = JSON.stringify(filteredItems)
      await AsyncStorage.setItem('RECENT_CHURCHES', churchlist)
    } catch (err) {
      console.log('SET RECENT CHURCHES ERROR', err)
    }
  }

  const renderChurchItem = (item: any) => {
    const churchImage = item.settings && item.settings[0].value
    return (
      <TouchableOpacity style={[globalStyles.listMainView, globalStyles.churchListView]} onPress={() => churchSelection(item)}>
        {
          churchImage ? <Image source={{ uri: churchImage }} style={globalStyles.churchListIcon} /> :
            <Image source={Constants.Images.ic_church} style={globalStyles.churchListIcon} />
        }
        <View style={globalStyles.listTextView}>
          <Text style={globalStyles.listTitleText}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={globalStyles.appContainer}>
      <BlueHeader />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={globalStyles.grayContainer}>
          <Text style={globalStyles.searchMainText}>Find Your Church</Text>
          <View style={globalStyles.textInputView}>
            <Image source={Constants.Images.ic_search} style={globalStyles.searchIcon} />
            <TextInput
              style={globalStyles.textInputStyle}
              placeholder={'Church name'}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType='default'
              placeholderTextColor={'lightgray'}
              value={searchText}
              onChangeText={(text) => { setSearchText(text) }}
            />
          </View>
          <TouchableOpacity style={{ ...globalStyles.roundBlueButton, marginTop: wp('6%') }} onPress={() => searchApiCall(searchText)}>
            {loading ? <ActivityIndicator size='small' color='white' animating={loading} /> : <Text style={globalStyles.roundBlueButtonText}>SEARCH</Text>}
          </TouchableOpacity>
          {searchText == '' && <Text style={globalStyles.recentText}>
            {recentListEmpty ? 'Recent Churches' : 'No recent churches available.'}
          </Text>}

          <FlatList data={searchText == '' ? recentList : searchList} renderItem={({ item }) => renderChurchItem(item)} keyExtractor={(item: any) => item.id} style={globalStyles.churchListStyle} />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

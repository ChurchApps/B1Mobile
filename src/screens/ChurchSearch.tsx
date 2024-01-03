import React, { useState, useEffect } from 'react';
import { View,  Image, Text, ActivityIndicator, Alert, DevSettings, TouchableWithoutFeedback, Keyboard, Dimensions, PixelRatio, Platform } from 'react-native';
import { FlatList, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ApiHelper, ArrayHelper, ChurchInterface, Constants, Utilities } from '../helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles, UserHelper } from '../helpers';
import { BlueHeader } from '../components';
import RNRestart from 'react-native-restart';
import { ErrorHelper } from '../helpers/ErrorHelper';

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

  const [dimension, setDimension] = useState(Dimensions.get('window'));

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
  };

  useEffect(() => {
    Utilities.trackEvent("Church Search Screen");
    GetRecentList();
    UserHelper.addOpenScreenEvent('ChurchSearch');
    Dimensions.addEventListener('change', () => {
      const dim = Dimensions.get('screen')
      setDimension(dim);
    })
  }, [])
  useEffect(() => {
  }, [dimension])

  const churchSelection = async (churchData: ChurchInterface) => {
    StoreToRecent(churchData);
    try {
      let existing = null;
      try {
        if (UserHelper.churches) existing = ArrayHelper.getOne(UserHelper.churches, "church.id", churchData.id);
      } catch (e : any){ 
        ErrorHelper.logError("store-recent-church", e);
      }
      if (existing) churchData = existing.church;
      const churchValue = JSON.stringify(churchData);
      await AsyncStorage.setItem('CHURCH_DATA', churchValue)
      UserHelper.addAnalyticsEvent('church_selected', {
        id: Date.now(),
        device : Platform.OS,
        church: churchData.name,
      });
      //await UserHelper.setCurrentUserChurch(userChurch);
      if (UserHelper.user) UserHelper.setPersonRecord();
      //DevSettings.reload()
      RNRestart.Restart();
    } catch (err : any) {
      ErrorHelper.logError("church-search", err);
    }
  }

  const searchApiCall = (text: String) => {
    setLoading(true);
    ApiHelper.getAnonymous("/churches/search/?name=" + text + "&app=B1&include=logoSquare", "MembershipApi").then(data => {
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
    } catch (err : any) {
      console.log('GET RECENT CHURCHES ERROR', err)
      ErrorHelper.logError("get-recent-church", err);
    }
  }

  const StoreToRecent = async (churchData: any) => {
    var filteredItems: any[] = [];
    filteredItems = recentList.filter((item: any) => item.id !== churchData.id);
    filteredItems.push(churchData);
    try {
      const churchlist = JSON.stringify(filteredItems)
      await AsyncStorage.setItem('RECENT_CHURCHES', churchlist)
    } catch (err : any) {
      console.log('SET RECENT CHURCHES ERROR', err)
      ErrorHelper.logError("store-recent-church", err);
    }
  }

  const renderChurchItem = (item: any) => {
    const churchImage = item.settings && item.settings[0].value
    return (
      <TouchableOpacity style={[globalStyles.listMainView, globalStyles.churchListView, { width: wd('90%') }]} onPress={() => churchSelection(item)}>
        { churchImage && churchImage != null ? <Image source={{ uri: churchImage }} style={globalStyles.churchListIcon} />  :
           churchImage == undefined ? <Image source={Constants.Images.ic_church} style={globalStyles.churchListIcon} /> : null }
        <View style={globalStyles.listTextView}>
          <Text style={globalStyles.listTitleText}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const getHeaderView = () => {
    return (
      <View>
        <BlueHeader />
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={globalStyles.grayContainer}>
              <Text style={globalStyles.searchMainText}>Find Your Church</Text>
              <View style={[globalStyles.textInputView, { width: wd('90%') }]}>
                <Image source={Constants.Images.ic_search} style={globalStyles.searchIcon} />
                <TextInput
                  style={[globalStyles.textInputStyle, { width: wd('90%') }]}
                  placeholder={'Church name'}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType='default'
                  placeholderTextColor={'lightgray'}
                  value={searchText}
                  onChangeText={(text) => { setSearchText(text) }}
                />
              </View>
              <TouchableOpacity style={{ ...globalStyles.roundBlueButton, marginTop: wp('6%'), width: wd('90%') }} onPress={() => searchApiCall(searchText)}>
                {loading ? <ActivityIndicator size='small' color='white' animating={loading} /> : <Text style={globalStyles.roundBlueButtonText}>SEARCH</Text>}
              </TouchableOpacity>
              {searchText == '' && <Text style={globalStyles.recentText}>
                {recentListEmpty ? 'Recent Churches' : 'No recent churches available.'}
              </Text>}
      </View>
      </TouchableWithoutFeedback>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Constants.Colors.gray_bg }}>
      <FlatList 
        data={searchText == '' ? recentList : searchList} 
        renderItem={({ item }) => renderChurchItem(item)} 
        keyExtractor={(item: any) => item.id} 
        ListHeaderComponent={getHeaderView()}
      />
    </View>
  );
};

import { BlueHeader } from '@/src/components/exports';
import { ArrayHelper, CacheHelper, ChurchInterface, Constants, UserHelper, globalStyles } from '@/src/helpers';
import { ErrorHelper } from '@/src/helpers/ErrorHelper';
import { ApiHelper, DimensionHelper } from '@churchapps/mobilehelper';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Keyboard, Platform, Text, TouchableWithoutFeedback, View } from 'react-native';
import { FlatList, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import RNRestart from 'react-native-restart';

const ChurchSearch = () => {

  const [searchText, setSearchText] = useState('');
  const [searchList, setSearchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentList, setRecentList] = useState<ChurchInterface[]>([]);
  const [recentListEmpty, setRecentListEmpty] = useState(false);


  useEffect(() => {
    // Utilities.trackEvent("Church Search Screen");
    GetRecentList();
    UserHelper.addOpenScreenEvent('ChurchSearch');
  }, [])

  const churchSelection = async (churchData: ChurchInterface) => {
    StoreToRecent(churchData);
    try {
      let existing: any = null;
      try {
        if (UserHelper.churches) existing = ArrayHelper.getOne(UserHelper.churches, "church.id", churchData.id);
      } catch (e: any) {
        ErrorHelper.logError("store-recent-church", e);
      }
      if (existing) churchData = existing.church;
      await CacheHelper.setValue("church", churchData);
      UserHelper.addAnalyticsEvent('church_selected', {
        id: Date.now(),
        device: Platform.OS,
        church: churchData.name,
      });
      //await UserHelper.setCurrentUserChurch(userChurch);
      if (UserHelper.user) UserHelper.setPersonRecord();
      router.navigate('/(drawer)/dashboard')
      //DevSettings.reload()
      RNRestart.Restart();
    } catch (err: any) {
      ErrorHelper.logError("church-search", err);
    }
  }

  const searchApiCall = async (text: String) => {
    console.log("text", text)
    setLoading(true);
    try {
      const data = await ApiHelper.getAnonymous("/churches/search/?name=" + text + "&app=B1&include=favicon_400x400", "MembershipApi")

      setSearchList(data)
      console.log(data)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }

  }



  const GetRecentList = async () => {
    try {
      const list = CacheHelper.recentChurches;
      if (list.length === 0) setRecentListEmpty(true);
      else {
        let reverseList = list.reverse()
        setRecentList(reverseList);
      }
    } catch (err: any) {
      console.log('GET RECENT CHURCHES ERROR', err)
      ErrorHelper.logError("get-recent-church", err);
    }
  }

  const StoreToRecent = async (churchData: any) => {
    var filteredItems: any[] = [];
    filteredItems = recentList.filter((item: any) => item.id !== churchData.id);
    filteredItems.push(churchData);
    try {
      await CacheHelper.setValue("recentChurches", filteredItems);
    } catch (err: any) {
      console.log('SET RECENT CHURCHES ERROR', err)
      ErrorHelper.logError("store-recent-church", err);
    }
  }


  const renderChurchItem = (item: any) => {
    let churchImage = Constants.Images.ic_church;
    if (item.settings && item.settings.length > 0) {
      let setting = ArrayHelper.getOne(item.settings, "keyName", "favicon_400x400");
      if (!setting) setting = item.settings[0];
      churchImage = { uri: setting.value };
    }
    return (
      <TouchableOpacity style={[globalStyles.listMainView, globalStyles.churchListView, { width: DimensionHelper.wp('90%') }]} onPress={() => churchSelection(item)}>
        <Image source={churchImage} style={globalStyles.churchListIcon} />
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
            <View style={[globalStyles.textInputView, { width: DimensionHelper.wp('90%') }]}>
              <Image source={Constants.Images.ic_search} style={globalStyles.searchIcon} />
              <TextInput
                style={[globalStyles.textInputStyle, { width: DimensionHelper.wp('90%') }]}
                placeholder={'Church name'}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType='default'
                placeholderTextColor={'lightgray'}
                value={searchText}
                onChangeText={(text) => { setSearchText(text) }}
              />
            </View>
            <TouchableOpacity style={{ ...globalStyles.roundBlueButton, marginTop: DimensionHelper.wp('6%'), width: DimensionHelper.wp('90%') }} onPress={() => searchApiCall(searchText)}>
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
        keyExtractor={(item: any, index: any) => index.toString()}
        ListHeaderComponent={getHeaderView()}
      />
    </View>
  );
}

export default ChurchSearch


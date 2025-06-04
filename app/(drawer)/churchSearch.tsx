import React from 'react';
import { BlueHeader } from '@/src/components/BlueHeader';
import { ArrayHelper, CacheHelper, ChurchInterface, UserHelper, globalStyles, Constants } from '@/src/helpers'; // Constants kept for Images
import { ErrorHelper } from '@/src/helpers/ErrorHelper';
import { ApiHelper } from '@churchapps/mobilehelper';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Keyboard, Platform, TouchableWithoutFeedback, View, StyleSheet } from 'react-native'; // ActivityIndicator, Text, TouchableOpacity removed from here
import { FlatList } from 'react-native-gesture-handler'; // TextInput removed
import RNRestart from 'react-native-restart';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { ActivityIndicator as PaperActivityIndicator, Avatar, Button as PaperButton, List, Text as PaperText, TextInput as PaperTextInput, TouchableRipple, useTheme } from 'react-native-paper';

const ChurchSearch = () => {
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [searchList, setSearchList] = useState<ChurchInterface[]>([]); // Typed searchList
  const [loading, setLoading] = useState(false);
  const [recentList, setRecentList] = useState<ChurchInterface[]>([]);
  const [recentListEmpty, setRecentListEmpty] = useState(false);

  useEffect(() => {
    GetRecentList();
    UserHelper.addOpenScreenEvent("Church Search Screen");
  }, []);

  const churchSelection = async (churchData: ChurchInterface) => {
    StoreToRecent(churchData);
    try {
      let existing: any = null;
      if (UserHelper.churches) existing = ArrayHelper.getOne(UserHelper.churches, "church.id", churchData.id);
      if (existing) churchData = existing.church;
      await CacheHelper.setValue("church", churchData);
      UserHelper.addAnalyticsEvent('church_selected', { id: Date.now(), device: Platform.OS, church: churchData.name });
      if (UserHelper.user) UserHelper.setPersonRecord();
      router.navigate('/(drawer)/dashboard');
      RNRestart.Restart();
    } catch (err: any) { ErrorHelper.logError("church-search", err); }
  };

  const searchApiCall = async (text: String) => {
    if (!text.trim()) return; // Avoid empty search
    setLoading(true);
    setSearchList([]); // Clear previous results
    try {
      const data = await ApiHelper.getAnonymous(`/churches/search/?name=${text}&app=B1&include=favicon_400x400`, "MembershipApi");
      setSearchList(data);
    } catch (error) { console.log(error); }
    finally { setLoading(false); }
  };

  const GetRecentList = async () => {
    try {
      const list: ChurchInterface[] = CacheHelper.recentChurches || []; // Ensure list is array
      if (list.length === 0) setRecentListEmpty(true);
      else { setRecentList(list.reverse()); }
    } catch (err: any) { ErrorHelper.logError("get-recent-church", err); }
  };

  const StoreToRecent = async (churchData: ChurchInterface) => {
    var filteredItems: ChurchInterface[] = (recentList || []).filter((item: ChurchInterface) => item.id !== churchData.id);
    filteredItems.push(churchData);
    try { await CacheHelper.setValue("recentChurches", filteredItems); }
    catch (err: any) { ErrorHelper.logError("store-recent-church", err); }
  };

  const renderChurchItem = ({ item }: { item: ChurchInterface }) => { // Typed item
    let churchImageSource = Constants.Images.ic_church; // Default local image
    const faviconSetting = ArrayHelper.getOne(item.settings || [], "keyName", "favicon_400x400");
    if (faviconSetting?.value) { churchImageSource = { uri: faviconSetting.value }; }

    return (
      <List.Item
        title={item.name}
        titleStyle={{ color: theme.colors.onSurface }}
        style={styles.listItem}
        onPress={() => churchSelection(item)}
        left={props => <Avatar.Image {...props} source={churchImageSource} size={DimensionHelper.wp(12)} style={styles.listIconStyle} />}
      />
    );
  };

  const getHeaderView = () => {
    return (
      <View>
        <BlueHeader /> {/* Already refactored */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={[globalStyles.grayContainer, { backgroundColor: theme.colors.background, padding: theme.spacing?.md }]}>
            <PaperText variant="headlineSmall" style={[globalStyles.searchMainText, { color: theme.colors.onBackground, textAlign: 'center' }]}>Find Your Church</PaperText>
            <PaperTextInput
              label="Church name"
              value={searchText}
              onChangeText={setSearchText}
              mode="outlined"
              style={[globalStyles.textInputStyle, styles.searchInput, { backgroundColor: theme.colors.surface }]} // Keep width, update others
              left={<PaperTextInput.Icon icon="magnify" color={theme.colors.placeholder} />}
              onSubmitEditing={() => searchApiCall(searchText)} // Search on submit
            />
            <PaperButton
              mode="contained"
              onPress={() => searchApiCall(searchText)}
              style={[globalStyles.roundBlueButton, styles.searchButton, { backgroundColor: theme.colors.primary }]} // Keep width, update others
              labelStyle={[globalStyles.roundBlueButtonText, {color: theme.colors.onPrimary}]}
              loading={loading}
              disabled={loading}
            >
              {!loading && "SEARCH"}
            </PaperButton>
            {searchText === '' && (
              <PaperText style={[globalStyles.recentText, { color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: theme.spacing?.md }]}>
                {recentListEmpty ? 'No recent churches available.' : 'Recent Churches'}
              </PaperText>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={searchText === '' ? recentList : searchList}
        renderItem={renderChurchItem}
        keyExtractor={(item) => item.id.toString()} // Use item.id
        ListHeaderComponent={getHeaderView()}
        contentContainerStyle={{ flexGrow: 1 }} // Ensure header is always visible even with few items
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchInput: {
    // from globalStyles.textInputStyle and textInputView
    // width: DimensionHelper.wp(90), // Handled by parent or props if needed
    marginTop: DimensionHelper.wp(4), // Example margin
  },
  searchButton: {
    // from globalStyles.roundBlueButton
    // width: DimensionHelper.wp(90), // Handled by parent or props if needed
    marginTop: DimensionHelper.wp(6),
  },
  listItem: {
    // from globalStyles.listMainView, globalStyles.churchListView
    // width: DimensionHelper.wp(90), // List.Item typically full width
    alignSelf: 'center',
    width: '90%', // If specific width is needed
    marginVertical: 4,
    backgroundColor: theme.colors.surface, // Example, for card-like items
    borderRadius: theme.roundness,
  },
  listIconStyle: {
    // from globalStyles.churchListIcon
    // No specific style needed if Avatar.Image default is okay
    // backgroundColor: 'transparent' // If default has a background
  }
});

export default ChurchSearch;

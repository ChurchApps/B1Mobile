import React from 'react';
import { BlueHeader } from '@/src/components/BlueHeader';
import { ApiHelper, Constants, ConversationCheckInterface, UserHelper, UserSearchInterface, globalStyles } from '@/src/helpers'; // Constants for Images
import { ErrorHelper } from '@/src/helpers/ErrorHelper';
import { NavigationProps } from '@/src/interfaces'; // Unused
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Keyboard, TouchableWithoutFeedback, View, StyleSheet } from 'react-native'; // ActivityIndicator, Text, TouchableOpacity, TextInput (from RNGH) removed
import { ActivityIndicator as PaperActivityIndicator, Avatar, Button as PaperButton, List, Text as PaperText, TextInput as PaperTextInput, useTheme } from 'react-native-paper';

// interface Props { // Unused
//   navigation: NavigationProps;
// }

const SearchMessageUser = () => { // Removed props
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [searchText, setSearchText] = useState('');
  const [searchList, setSearchList] = useState<UserSearchInterface[]>([]);
  const [loading, setLoading] = useState(false);
  // recentList and recentListEmpty seem unused, based on FlatList data prop logic
  // const [recentList, setRecentList] = useState([]);
  // const [recentListEmpty, setRecentListEmpty] = useState(false);

  useEffect(() => {
    getPreviousConversations();
    UserHelper.addOpenScreenEvent("User Search Screen");
  }, []);

  const getPreviousConversations = () => {
    setLoading(true);
    ApiHelper.get("/privateMessages", "MessagingApi").then((data: ConversationCheckInterface[]) => {
      if (data && Object.keys(data).length !== 0) {
        const userIdList: string[] = data.map((e) =>
          UserHelper.currentUserChurch.person.id === e.fromPersonId ? e.toPersonId : e.fromPersonId
        ).filter(id => id); // Filter out undefined ids

        if (userIdList.length !== 0) {
          ApiHelper.get("/people/basic?ids=" + userIdList.join(','), "MembershipApi").then((userData: UserSearchInterface[]) => {
            if (userData) {
              for (let i = 0; i < userData.length; i++) {
                const singleUser: UserSearchInterface = userData[i];
                const tempConvo: ConversationCheckInterface | undefined = data.find(x => x.fromPersonId === singleUser.id || x.toPersonId === singleUser.id);
                userData[i].conversationId = tempConvo?.conversationId;
              }
              setSearchList(userData);
            } else {
              setSearchList([]);
            }
          }).catch(e => { console.error(e); setSearchList([]); }).finally(() => setLoading(false));
        } else {
          setSearchList([]);
          setLoading(false);
        }
      } else {
        setSearchList([]);
        setLoading(false);
      }
    }).catch(e => { console.error(e); setSearchList([]); setLoading(false); });
  };

  const searchUserApiCall = (text: string) => {
    if (!text.trim()) { // If search text is empty, show previous conversations
      getPreviousConversations();
      return;
    }
    setLoading(true);
    setSearchList([]); // Clear previous search results
    ApiHelper.get("/people/search/?term=" + text, "MembershipApi").then(data => {
      setSearchList(data || []); // Ensure data is an array
      if (!data || data.length === 0) Alert.alert("Alert", "No matches found");
    }).catch(e => { console.error(e); Alert.alert("Error", "Search failed."); })
    .finally(() => setLoading(false));
  };

  const renderUserItem = ({ item }: { item: UserSearchInterface }) => { // Typed item
    const userImage = item.photo;
    return (
      <List.Item
        title={item.name.display}
        titleStyle={{color: theme.colors.onSurface}}
        style={styles.listItem}
        onPress={() => userSelection(item)}
        left={props => userImage
            ? <Avatar.Image {...props} source={{ uri: userImage }} size={DimensionHelper.wp(12)} style={styles.avatar} />
            : <Avatar.Icon {...props} icon="account" size={DimensionHelper.wp(12)} style={styles.avatar} />
        }
      />
    );
  };

  const userSelection = async (userData: UserSearchInterface) => {
    try {
      router.navigate({ pathname: '/(drawer)/messageScreen', params: { userDetails: JSON.stringify(userData) } });
    } catch (err: any) { ErrorHelper.logError("user-selection", err); }
  };

  const styles = StyleSheet.create({
    mainView: { flex: 1, backgroundColor: theme.colors.background },
    headerContainer: { backgroundColor: theme.colors.background, padding: theme.spacing?.md }, // For content under BlueHeader
    titleText: { ...globalStyles.searchMainText, color: theme.colors.onBackground, textAlign: 'center', marginBottom: theme.spacing?.md },
    searchInput: { width: DimensionHelper.wp(90), backgroundColor: theme.colors.surface, alignSelf: 'center', marginBottom: theme.spacing?.md },
    searchButton: { ...globalStyles.roundBlueButton, width: DimensionHelper.wp(90), backgroundColor: theme.colors.primary, alignSelf: 'center', marginTop: DimensionHelper.wp(2) },
    searchButtonText: { ...globalStyles.roundBlueButtonText, color: theme.colors.onPrimary },
    listItem: { backgroundColor: theme.colors.surface, borderRadius: theme.roundness, marginVertical: 4, width: DimensionHelper.wp(90), alignSelf: 'center' },
    avatar: { backgroundColor: theme.colors.surfaceVariant },
    emptyListText: {textAlign:'center', marginTop: theme.spacing?.lg, color: theme.colors.onSurfaceVariant }
  });

  const getHeaderView = () => (
    <View>
      <BlueHeader /> {/* navigation and showMenu props are handled by BlueHeader's defaults or not needed */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.headerContainer}>
          <PaperText variant="headlineSmall" style={styles.titleText}>Search for a person</PaperText>
          <PaperTextInput
            label="Name"
            value={searchText}
            onChangeText={setSearchText} // Update search text, button triggers API call
            mode="outlined"
            style={styles.searchInput}
            left={<PaperTextInput.Icon icon="magnify" />}
            onSubmitEditing={() => searchUserApiCall(searchText)}
          />
          <PaperButton
            mode="contained"
            onPress={() => searchUserApiCall(searchText)}
            style={styles.searchButton}
            labelStyle={styles.searchButtonText}
            loading={loading && searchText !== ""} // Show loading only when actively searching
            disabled={loading}
          >
            {!(loading && searchText !== "") && "SEARCH"}
          </PaperButton>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );

  const flatListData = searchText === '' ? searchList : searchList; // Simplified logic: if searchText is empty, show initial list (previous convos), else show filtered searchList.

  return (
    <View style={styles.mainView}>
      <FlatList
        data={flatListData}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={getHeaderView()}
        ListEmptyComponent={!loading ? <PaperText style={styles.emptyListText}>No users found.</PaperText> : null}
        contentContainerStyle={{flexGrow:1}}
        keyboardShouldPersistTaps="handled" // Good for search lists
      />
      {/* Loading indicator for initial load of previous conversations */}
      {loading && searchText === "" && <PaperActivityIndicator animating={true} color={theme.colors.primary} style={{marginTop: 20}} />}
    </View>
  );
};
export default SearchMessageUser;

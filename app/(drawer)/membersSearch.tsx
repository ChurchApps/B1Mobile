import React from 'react';
import { Loader } from '@/src/components/Loader';
import { MainHeader } from '@/src/components/wrapper/MainHeader';
import { ApiHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from '@/src/helpers';
import { NavigationProps } from '@/src/interfaces'; // Unused, consider removing
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, View, StyleSheet } from 'react-native'; // Image, Text, TextInput, TouchableOpacity removed
import { FlatList } from 'react-native-gesture-handler'; // TouchableOpacity removed
import { ActivityIndicator as PaperActivityIndicator, Avatar, Button as PaperButton, List, Text as PaperText, TextInput as PaperTextInput, useTheme } from 'react-native-paper';

// interface Props { // Unused
//   navigation: NavigationProps;
// }

const MembersSearch = () => { // Removed props: Props
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [searchText, setSearchText] = useState('');
  const [searchList, setSearchList] = useState<any[]>([]); // Initialize as empty array
  const [membersList, setMembersList] = useState<any[]>([]); // Initialize as empty array
  const [isLoading, setLoading] = useState(false); // Initial loading state for fetching all members

  useEffect(() => {
    loadMembers();
    UserHelper.addOpenScreenEvent("Member Search Screen");
  }, []);

  const loadMembers = () => {
    setLoading(true); // Start loading before API call
    ApiHelper.get("/people", "MembershipApi").then(data => {
      setSearchList(data || []); // Ensure data is an array
      setMembersList(data || []); // Ensure data is an array
      // if (data.length === 0) Alert.alert("Alert", "No members found in the directory."); // Consider if this alert is needed on initial load
    }).catch(e => {
      console.error(e);
      Alert.alert("Error", "Failed to load members.");
    }).finally(() => setLoading(false));
  };

  const filterMember = (text: string) => {
    setSearchText(text); // Update searchText state first
    if (text.trim() === '') {
      setSearchList(membersList); // Show all members if search text is empty
    } else {
      const filterList = membersList.filter((item: any) => {
        return item.name.display.toLowerCase().includes(text.toLowerCase()); // Use includes for partial match
      });
      setSearchList(filterList);
    }
  };

  const renderMemberItem = ({ item }: { item: any }) => { // Typed item
    const photoUri = item.photo ? EnvironmentHelper.ContentRoot + item.photo : null;
    return (
      <List.Item
        title={item.name.display}
        titleStyle={{color: theme.colors.onSurface}}
        style={styles.listItem}
        onPress={() => router.navigate({ pathname: '/(drawer)/memberDetail', params: { member: JSON.stringify(item) } })}
        left={props => photoUri
            ? <Avatar.Image {...props} source={{ uri: photoUri }} size={DimensionHelper.wp(12)} style={styles.avatar} />
            : <Avatar.Icon {...props} icon="account" size={DimensionHelper.wp(12)} style={styles.avatar} />
        }
      />
    );
  };

  const getResults = () => {
    // isLoading is for the initial load of all members. Search filtering itself is synchronous.
    // If search API was used, a different loading state would be needed for search button.
    if (isLoading && membersList.length === 0) return <PaperActivityIndicator animating={true} color={theme.colors.primary} style={styles.activityIndicator} />;
    if (searchList.length === 0 && searchText !== '') return <PaperText style={styles.noResultsText}>No results found for "{searchText}"</PaperText>;
    if (searchList.length === 0 && membersList.length > 0 && searchText === '') return <PaperText style={styles.noResultsText}>Use the search bar to find members.</PaperText>; // Prompt to search if members are loaded but search is empty
    if (membersList.length === 0 && !isLoading) return <PaperText style={styles.noResultsText}>No members in directory.</PaperText>; // If initial load yields no members

    return <FlatList data={searchList} renderItem={renderMemberItem} keyExtractor={(item: any) => item.id.toString()} style={styles.listStyle} />;
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center' },
    contentContainer: { width: DimensionHelper.wp(100), flex: 1, alignItems: 'center' }, // Removed justifyContent: 'center' to allow list to flow
    titleText: { ...globalStyles.searchMainText, marginHorizontal: DimensionHelper.wp(5), color: theme.colors.onBackground, marginBottom: theme.spacing?.md },
    searchInput: { width: DimensionHelper.wp(90), backgroundColor: theme.colors.surface, marginBottom: theme.spacing?.md },
    searchButton: { ...globalStyles.roundBlueButton, width: DimensionHelper.wp(90), backgroundColor: theme.colors.primary, marginTop: 0 /* Removed fixed margin */ },
    searchButtonText: { ...globalStyles.roundBlueButtonText, color: theme.colors.onPrimary },
    listItem: { backgroundColor: theme.colors.surface, borderRadius: theme.roundness, marginVertical: 4, width: DimensionHelper.wp(90), alignSelf: 'center' },
    avatar: { backgroundColor: theme.colors.surfaceVariant },
    noResultsText: { ...globalStyles.recentText, color: theme.colors.onSurfaceVariant, marginTop: theme.spacing?.lg },
    activityIndicator: { marginTop: theme.spacing?.lg },
    listStyle: { ...globalStyles.churchListStyle, width: '100%' } // Ensure FlatList takes width
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <MainHeader title="Directory" openDrawer={navigation.openDrawer} back={navigation.goBack} />
      <View style={styles.contentContainer}>
        <PaperText variant="headlineSmall" style={styles.titleText}>Find Members</PaperText>
        <PaperTextInput
          label="Member Name"
          value={searchText}
          onChangeText={filterMember} // filterMember updates searchText and searchList
          mode="outlined"
          style={styles.searchInput}
          left={<PaperTextInput.Icon icon="magnify" />}
          // No separate search button needed if filtering happens on text change.
          // If a button is desired, filterMember can be called onPress.
          // For this iteration, let's assume filtering on text change is sufficient.
          // The original had a button, so let's keep it for consistency for now.
        />
        <PaperButton
          mode="contained"
          style={styles.searchButton}
          labelStyle={styles.searchButtonText}
          onPress={() => filterMember(searchText)} // Explicitly trigger filter, though it also runs on text change
        >
          SEARCH
        </PaperButton>
        {getResults()}
      </View>
      {/* Loader component might be redundant if PaperActivityIndicator is used directly in getResults */}
      {/* {isLoading && <Loader isLoading={isLoading} />} */}
    </SafeAreaView>
  );
};
export default MembersSearch;

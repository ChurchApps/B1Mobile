import { DimensionHelper } from '@churchapps/mobilehelper';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Keyboard, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { BlueHeader } from '../components';
import { ApiHelper, Constants, ConversationCheckInterface, UserHelper, UserSearchInterface, Utilities, globalStyles } from '../helpers';
import { ErrorHelper } from '../helpers/ErrorHelper';
import { NavigationProps } from '../interfaces';

interface Props {
    navigation: NavigationProps;
}

export const SearchUserScreen = (props: Props) => {
    const [searchText, setSearchText] = useState('');
    const [searchList, setSearchList] = useState<UserSearchInterface[]>([]);
    const [loading, setLoading] = useState(false);
    const [recentList, setRecentList] = useState([]);
    const [recentListEmpty, setRecentListEmpty] = useState(false);
  
    useEffect(() => {
        Utilities.trackEvent("User search Screen");
        // GetRecentList();
        getPreviousConversations();
        UserHelper.addOpenScreenEvent('SearchMessageUser');
      }, [])

      const getPreviousConversations = () => {
        setLoading(true);
        ApiHelper.get("/privateMessages", "MessagingApi").then((data : ConversationCheckInterface[]) => {
          setLoading(false);
          var userIdList : string[] = []
          if(Object.keys(data).length != 0){
            userIdList = data.map((e) => UserHelper.currentUserChurch.person.id == e.fromPersonId ? e.toPersonId : e.fromPersonId);
            if(userIdList.length != 0){
              ApiHelper.get("/people/ids?ids=" + userIdList.join(','), "MembershipApi").then((userData : UserSearchInterface[]) => {
                setLoading(false);
                for (let i = 0; i < userData.length; i++) {
                  const singleUser : UserSearchInterface = userData[i];
                  const tempConvo : ConversationCheckInterface | undefined = data.find(x => x.fromPersonId == singleUser.id || x.toPersonId == singleUser.id)
                  userData[i].conversationId = tempConvo?.conversationId
                }
                setSearchList(userData);
              })
            }
          }        
        })
      }

      const searchUserApiCall = (text: String) => {
        setLoading(true);
        ApiHelper.get("/people/search/?term=" + text, "MembershipApi").then(data => {
          setLoading(false);
          setSearchList(data);
          if (data.length === 0) Alert.alert("Alert", "No matches found");
        })
      }

      const renderUserItem = (item: UserSearchInterface) => {
        const userImage = item.photo
        return (
          <TouchableOpacity style={[globalStyles.listMainView, globalStyles.churchListView, { width: DimensionHelper.wp('90%') }]} onPress={() => userSelection(item)}>
            {
              userImage ? <Image source={{ uri: userImage }} style={globalStyles.churchListIcon} /> :
                <Image source={Constants.Images.ic_user} style={[globalStyles.churchListIcon, {tintColor: Constants.Colors.app_color, height: DimensionHelper.wp('9%'), width: DimensionHelper.wp('9%')}]}/>
            }
            <View style={globalStyles.listTextView}>
              <Text style={globalStyles.listTitleText}>{item.name.display}</Text>
            </View>
          </TouchableOpacity>
        );
      }

      const userSelection = async (userData: UserSearchInterface) => {
        try {
          props.navigation.navigate('MessagesScreen', { userDetails: userData })
        } catch (err : any) {
          console.log(err)
          ErrorHelper.logError("user-selection", err);
        }
      }

      const getHeaderView = () => {
        return (
          <View>
            <BlueHeader navigation={props.navigation} showMenu={true} />
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={globalStyles.grayContainer}>
                  <Text style={globalStyles.searchMainText}>Search for a person</Text>
                  <View style={[globalStyles.textInputView, { width: DimensionHelper.wp('90%') }]}>
                    <Image source={Constants.Images.ic_search} style={globalStyles.searchIcon} />
                    <TextInput
                      style={[globalStyles.textInputStyle, { width: DimensionHelper.wp('90%') }]}
                      placeholder={'Name'}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType='default'
                      placeholderTextColor={'lightgray'}
                      value={searchText}
                      onChangeText={(text) => { setSearchText(text) }}
                    />
                  </View>
                  <TouchableOpacity style={{ ...globalStyles.roundBlueButton, marginTop: DimensionHelper.wp('6%'), width: DimensionHelper.wp('90%') }} onPress={() => searchUserApiCall(searchText)}>
                    {loading ? <ActivityIndicator size='small' color='white' animating={loading} /> : <Text style={globalStyles.roundBlueButtonText}>SEARCH</Text>}
                  </TouchableOpacity>
          </View>
          </TouchableWithoutFeedback>
          </View>
        );
      }      

      return (
        <View style={{ flex: 1, backgroundColor: Constants.Colors.gray_bg }}>
          <FlatList 
            data={searchText == '' ? searchList.length != 0 ? searchList :recentList : searchList} 
            renderItem={({ item }) => renderUserItem(item)} 
            keyExtractor={(item: any) => item.id} 
            ListHeaderComponent={getHeaderView()}
          />
        </View>
      );
}
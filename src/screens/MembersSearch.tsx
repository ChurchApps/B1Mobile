import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Image, Text, Alert } from 'react-native';
import { FlatList, ScrollView, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Images from '../utils/Images';
import { getMembersList } from '../redux/actions/membersListAction';
import { connect } from 'react-redux';
import { globalStyles } from '../helper';
import { BlueHeader, Loader } from '../components';
import { getToken } from '../helper/_ApiHelper';
import API from '../helper/ApiConstants';

interface Props {
    navigation: {
        navigate: (screenName: string, params: any) => void;
        goBack: () => void;
        openDrawer: () => void;
    };
    getAllMembersList: (token: any, callback: any) => void;
}

const MembersSearch = (props: Props) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    const [searchText, setSearchText] = useState('');
    const [searchList, setSearchList] = useState([]);
    const [membersList, setMembersList] = useState([]);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        membersListApiCall()
    }, [])

    const membersListApiCall = async() => {
        setLoading(true);
        const token = await getToken("MembershipApi")
        props.getAllMembersList(token, (err: any, res: any) => {
            setLoading(false);
            if (!err) {
                if (res.data.length != 0) {
                    setMembersList(res.data)
                    setSearchList(res.data)
                } else {
                    setSearchList([])
                    Alert.alert("Alert", "Members not found!!");
                }
            } else {
                Alert.alert("Alert", err.message);
            }
        });
    }

    const filterMember = (searchText: string) => {
        let filterList = membersList.filter((item: any) => {
            if(item.name.display.toLowerCase().match(searchText.toLowerCase())) { return item }
        })
        if (searchText != '') {
            setSearchList(filterList)    
        } else {
            setSearchList(membersList)
        }
    }

    const renderMemberItem = (item: any) => {
        return (
            <TouchableOpacity style={globalStyles.listMainView} onPress={() => {navigate('MemberDetailScreen', { member: item })}}>
                <Image source={item.photo ? { uri: API.IMAGE_URL + item.photo } : Images.ic_member} style={globalStyles.memberListIcon} /> 
                <View style={globalStyles.listTextView}>
                    <Text style={globalStyles.listTitleText}>{item.name.display}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView style={globalStyles.appContainer}>
            <BlueHeader />
            <ScrollView style={globalStyles.grayContainer}>
                <Text style={globalStyles.searchMainText}>Find Members</Text>
                <View style={globalStyles.textInputView}>
                    <Image source={Images.ic_search} style={globalStyles.searchIcon} />
                    <TextInput
                        style={globalStyles.textInputStyle}
                        placeholder={'Member Name'}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType='default'
                        placeholderTextColor={'lightgray'}
                        value={searchText}
                        onChangeText={(text) => { setSearchText(text) }}
                    />
                </View>
                <TouchableOpacity style={{...globalStyles.roundBlueButton, marginTop: wp('6%')}} onPress={() => filterMember(searchText)}>
                    <Text style={globalStyles.roundBlueButtonText}>SEARCH</Text>
                </TouchableOpacity>
                { searchList.length == 0 && <Text style={globalStyles.recentText}> 
                     Member Not Available!!
                </Text> }
                <FlatList data={searchList} renderItem={({ item }) => renderMemberItem(item)} keyExtractor={(item: any) => item.id} style={globalStyles.churchListStyle} />
            </ScrollView>
            {isLoading && <Loader isLoading={isLoading} />}
        </SafeAreaView>
    );
};

const mapStateToProps = (state: any) => {
    return {
        members_list: state.members_list,
    };
};
const mapDispatchToProps = (dispatch: any) => {
    return {
        getAllMembersList: (token: any, callback: any) => dispatch(getMembersList(token, callback))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MembersSearch);
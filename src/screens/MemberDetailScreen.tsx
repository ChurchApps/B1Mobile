import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Image, Text } from 'react-native';
import { ScrollView, } from 'react-native-gesture-handler';
import Images from '../utils/Images';
import globalStyles from '../helper/GlobalStyles';
import BlueHeader from '../components/BlueHeader';
import API from '../helper/ApiConstants';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
        goBack: () => void;
        openDrawer: () => void;
    };
    getAllMembersList: (token: any, callback: any) => void;
    route: {
        params:{
            member: any,
        }
    };
}

const MemberDetailScreen = (props: Props) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    const member = props.route.params.member;

    useEffect(() => {}, [])

    return (
        <SafeAreaView style={globalStyles.appContainer}>
            <BlueHeader />
            <ScrollView style={globalStyles.grayContainer}>
                {
                    member.photo ? <Image source={{ uri: API.IMAGE_URL + member.photo }} style={globalStyles.memberIcon} /> :
                        <Image source={Images.ic_member} style={globalStyles.memberIcon} />
                }
                <Text style={globalStyles.memberName}>{member.name.display}</Text>
                
                <View style={globalStyles.memberDetailContainer}>
                    <Text style={globalStyles.detailHeader}>Email :</Text>
                    <Text style={globalStyles.detailValue}>{member.contactInfo.email ? member.contactInfo.email : '-'}</Text>
                </View>

                <View style={globalStyles.memberDetailContainer}>
                    <Text style={globalStyles.detailHeader}>Phone :</Text>
                    <Text style={globalStyles.detailValue}>{member.contactInfo.homePhone ? member.contactInfo.homePhone : '-'}</Text>
                </View>

                <View style={globalStyles.memberDetailContainer}>
                    <Text style={globalStyles.detailHeader}>Address :</Text>
                    <Text style={globalStyles.detailValue}>{member.contactInfo.address1 ? member.contactInfo.address1 : '-'}</Text>
                </View>
                
                <Text style={[globalStyles.searchMainText, {alignSelf: 'center'}]}>- Household Members -</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default MemberDetailScreen;
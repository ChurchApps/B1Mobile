import React, { useState, useEffect } from 'react';
import {
    View,
    SafeAreaView,
    Image,
    StyleSheet,
    Text,
    ActivityIndicator
} from 'react-native';
import { FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Images from '../utils/Images';
import MainHeader from '../components/MainHeader';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
        goBack: () => void;
        openDrawer: () => void;
    };
}

const testList = [
    {
        id: 1,
        title: 'Church 1',
        location: 'New York'
    },
    {
        id: 2,
        title: 'Church 2',
        location: 'California'
    },
    {
        id: 3,
        title: 'Church 3',
        location: 'Los Angeles'
    },
    {
        id: 4,
        title: 'Church 4',
        location: 'Chicago'
    }
]

const ChurchSearch = (props: Props) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    const [searchText, setSearchText] = useState('');
    const [churchList, setChurchList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

    }, [])

    const renderChurchItem = (item: any) => {
        return (
            <TouchableOpacity style={styles.churchListView}>
                <Image source={Images.ic_church} style={styles.churchListIcon} />
                <View style={styles.churchListTextView}>
                    <Text style={styles.churchListTitle}>{item.title}</Text>
                    <Text style={styles.churchListLocation}>{item.location}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <MainHeader
                leftComponent={null}
                mainComponent={<Image source={Images.logoWhite} style={styles.mainIcon} />}
                rightComponent={null}
            />
            <View style={styles.mainView}>
                <Text style={styles.mainText}>Find Your Church</Text>
                <View style={styles.textInputView}>
                    <TextInput
                        style={styles.textInputStyle}
                        placeholder={'Church name'}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType='default'
                        placeholderTextColor={'lightgray'}
                        value={searchText}
                        onChangeText={(text) => { setSearchText(text) }}
                    />
                </View>
                <TouchableOpacity style={styles.searchButton}>
                    {loading ?
                        <ActivityIndicator size='small' color='white' animating={loading} /> :
                        <Text style={styles.searchText}>SEARCH</Text>
                    }
                </TouchableOpacity>
                <FlatList data={testList} renderItem={({ item }) => renderChurchItem(item)} keyExtractor={(item: any) => item.id} style={{marginVertical: wp('2%')}}/>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.app_color
    },
    menuIcon: {
        width: wp('6%'),
        height: wp('6%'),
        margin: wp('5%'),
        tintColor: 'white'
    },
    mainIcon: {
        width: wp('55%'),
        height: wp('55%'),
        margin: wp('5%'),
        resizeMode: 'contain',
        alignSelf: 'center'
    },
    mainView: {
        flex: 1,
        backgroundColor: Colors.gray_bg
    },
    mainText: {
        marginHorizontal: wp('5%'),
        marginTop: wp('8%'),
        fontSize: wp('4.5%'),
        fontFamily: Fonts.RobotoLight
    },
    textInputView: {
        height: wp('12%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: wp('6%'),
        marginHorizontal: wp('5%'),
        backgroundColor: 'white',
        borderRadius: wp('2%'),
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: wp('1.5%'),
        elevation: 5,
    },
    textInputStyle: {
        height: wp('10%'),
        width: wp('80%'),
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: wp('3.8%'),
        color: 'gray',
    },
    searchButton: {
        height: wp('12%'),
        width: wp('90%'),
        borderRadius: wp('2%'),
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: Colors.button_bg,
        marginTop: wp('6%'),
    },
    searchText: {
        color: 'white',
        fontSize: wp('3.8%'),
        fontFamily: Fonts.RobotoMedium
    },
    churchListView: {
        height: wp('16%'),
        width: wp('90%'),
        backgroundColor: 'white',
        alignSelf: 'center',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: wp('2%'),
        borderRadius: wp('2%'),
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: wp('1.5%'),
        elevation: 5,
        shadowColor: Colors.app_color,
        flexDirection: 'row'
    },
    churchListIcon: {
        width: wp('10%'),
        height: wp('10%'),
        marginLeft: wp('4%'),
        marginRight: wp('2.5%'),
        tintColor: Colors.app_color
    },
    churchListTextView: {
        height: wp('12%'),
        justifyContent: 'space-evenly'
    },
    churchListTitle: {
        fontSize: wp('4.2%'),
        fontFamily: Fonts.RobotoMedium
    },
    churchListLocation: {
        fontSize: wp('3.6%'),
        color: 'gray',
        fontFamily: Fonts.RobotoLight
    }
})

export default ChurchSearch;

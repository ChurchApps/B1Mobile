import React, { useState, useEffect } from 'react';
import {
    View,
    SafeAreaView,
    Image,
    StyleSheet,
    Text,
    ActivityIndicator,
    Alert,
    DevSettings
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSearchList } from '../redux/actions/searchListAction';
import { connect, useSelector } from 'react-redux';
import globalStyles from '../helper/GlobalStyles';
import BlueHeader from '../components/BlueHeader';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
        goBack: () => void;
        openDrawer: () => void;
    };
    getSearchChurchList: (searchText: String, callback: any) => void;
}

const ChurchSearch = (props: Props) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    const [searchText, setSearchText] = useState('');
    const [searchList, setSearchList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recentList, setRecentList] = useState([]);
    const [recentListEmpty, setRecentListEmpty] = useState(false);

    useEffect(() => {
        GetRecentList();
    }, [])

    const churchSelection = async (churchData: any) => {
        StoreToRecent(churchData);
        try {
            const churchValue = JSON.stringify(churchData)
            await AsyncStorage.setItem('CHURCH_DATA', churchValue)
            DevSettings.reload()
        } catch (err) {
            console.log(err)
        }
    }

    const searchApiCall = (text: String) => {
        setLoading(true);
        props.getSearchChurchList(text, (err: any, res: any) => {
            setLoading(false);
            if (!err) {
                if (res.data.length != 0) {
                    setSearchList(res.data)
                } else {
                    setSearchList([])
                    Alert.alert("Alert", "Search result not found!!");
                }
            } else {
                Alert.alert("Alert", err.message);
            }
        });
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
            console.log('GET RECENT CHURCHES ERROR',err)
        }
    }

    const StoreToRecent = async(churchData: any) => {
        var filteredItems: any[] = [];
        filteredItems = recentList.filter((item:any) => item.id !== churchData.id);
        filteredItems.push(churchData);
        try {
            const churchlist = JSON.stringify(filteredItems)
            await AsyncStorage.setItem('RECENT_CHURCHES', churchlist)
        } catch (err) {
            console.log('SET RECENT CHURCHES ERROR',err)
        }
    }

    const renderChurchItem = (item: any) => {
        const churchImage = item.settings && item.settings[0].value
        return (
            <TouchableOpacity style={[globalStyles.listMainView,styles.churchListView]} onPress={() => churchSelection(item)}>
                {
                    churchImage ? <Image source={{ uri: churchImage }} style={styles.churchListIcon} /> :
                        <Image source={Images.ic_church} style={styles.churchListIcon} />
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
            <View style={globalStyles.grayContainer}>
                <Text style={styles.mainText}>Find Your Church</Text>
                <View style={globalStyles.textInputView}>
                    <Image source={Images.ic_search} style={globalStyles.searchIcon} />
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
                <TouchableOpacity style={{...globalStyles.roundBlueButton, marginTop: wp('6%')}} onPress={() => searchApiCall(searchText)}>
                    {loading ? <ActivityIndicator size='small' color='white' animating={loading} /> : <Text style={globalStyles.roundBlueButtonText}>SEARCH</Text> }
                </TouchableOpacity>
                { searchText == '' && <Text style={styles.recentText}> 
                    {recentListEmpty ? 'Recent Churches' : 'Recent Churches Not Available!!'}
                </Text> }
                <FlatList data={searchText == '' ? recentList : searchList } renderItem={({ item }) => renderChurchItem(item)} keyExtractor={(item: any) => item.id} style={styles.churchListStyle} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainText: {
        marginHorizontal: wp('5%'),
        marginTop: wp('8%'),
        fontSize: wp('4.5%'),
        fontFamily: Fonts.RobotoLight
    },
    churchListView: {
        height: wp('16%'),
        shadowOpacity: 0.1,
    },
    churchListIcon: {
        width: wp('12%'),
        height: wp('12%'),
        marginHorizontal: wp('2.5%'),
        borderRadius: wp('1.5%')
    },
    churchListStyle: {
        marginVertical: wp('2%')
    },
    recentText: {
        marginHorizontal: wp('5%'),
        marginTop: wp('5%'),
        fontSize: wp('4%'),
        fontFamily: Fonts.RobotoRegular
    },
})

const mapStateToProps = (state: any) => {
    return {
        searchlist: state.searchlist,
    };
};
const mapDispatchToProps = (dispatch: any) => {
    return {
        getSearchChurchList: (searchText: any, callback: any) => dispatch(getSearchList(searchText, callback))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChurchSearch);


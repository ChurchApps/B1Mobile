import React, { useState, useEffect } from 'react';
import {
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import Images from '../utils/Images';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
        goBack: () => void;
        openDrawer: () => void;
    };
}

const GroupsScreen = (props: Props) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    const [selected, setSelected] = useState(null);
    const [groupList, setGroupList] = useState([{
        id: 1,
        name: 'Youth',
        classes: [{
            name: 'High School Boys',
        },{
            name: 'High School Girls',
        },{
            name: 'Middle School Boys',
        },{
            name: 'Middle School Boys',
        }]
    }, {
        id: 2,
        name: 'Kids',
        classes: [{
            name: 'High School Boys',
        },{
            name: 'High School Girls',
        },{
            name: 'Middle School Boys',
        },{
            name: 'Middle School Boys',
        }]
    }, {
        id: 3,
        name: 'ABF',
        classes: [{
            name: 'High School Boys',
        },{
            name: 'High School Girls',
        },{
            name: 'Middle School Boys',
        },{
            name: 'Middle School Boys',
        }]
    }]);

    useEffect(() => {

    }, [])

    const renderGroupItem = (item: any) => {
        return (
            <View>
                <TouchableOpacity style={styles.groupListView} onPress={() => { setSelected(item.id) }}>
                    <Icon name={selected == item.id ? 'angle-down' : 'angle-right'} style={styles.selectionIcon} size={wp('6%')} />
                    <View style={styles.groupListTextView}>
                        <Text style={styles.groupListTitle} numberOfLines={1}>{item.name}</Text>
                    </View>
                </TouchableOpacity>
                {selected == item.id && item.classes.map((item_class: any, index: any) => {
                    return (
                        <View style={{
                            ...styles.classesView, 
                            borderBottomWidth: ( index == item.classes.length - 1 ) ? 0 : 1
                        }}>
                            <TouchableOpacity 
                                style={styles.classesBtn}>
                                <Text style={styles.classesText}>
                                    {item_class.name}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerLogoView}>
                <Image source={Images.logoBlue} style={styles.mainIcon} />
            </View>
            <SafeAreaView style={{ flex: 1 }}>
                <FlatList
                    data={groupList}
                    renderItem={({ item }) => renderGroupItem(item)}
                    keyExtractor={(item: any) => item.id}
                    style={styles.groupListStyle}
                />
                <TouchableOpacity style={styles.noneBtn} onPress={() => navigate('HouseholdScreen')}>
                    <Text style={{...styles.classesText, color: 'white'}}>
                        NONE
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray_bg
    },
    headerLogoView: {
        borderBottomLeftRadius: wp('8%'),
        borderBottomRightRadius: wp('8%'),
        backgroundColor: 'white',
        shadowColor: Colors.app_color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: wp('1.5%'),
        elevation: 5,
    },
    mainIcon: {
        width: wp('55%'),
        height: wp('55%'),
        marginTop: wp('10%'),
        marginBottom: wp('4%'),
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    groupListView: {
        width: wp('90%'),
        backgroundColor: 'white',
        alignSelf: 'center',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: wp('2%'),
        borderRadius: wp('2%'),
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: wp('1.5%'),
        elevation: 5,
        shadowColor: Colors.app_color,
        flexDirection: 'row',
    },
    groupListTextView: {
        height: wp('12%'),
        justifyContent: 'space-evenly'
    },
    groupListTitle: {
        fontSize: wp('4.5%'),
        fontFamily: Fonts.RobotoMedium,
        color: Colors.app_color,
        marginLeft: wp('3%'),
        width: wp('65%'),
    },
    groupListStyle: {
        marginVertical: wp('3%'),
    },
    selectionIcon: {
        fontSize: wp('6%'),
        color: 'gray',
        marginLeft: wp('3%')
    },
    classesView: {
        width: wp('80%'),
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: wp('2%'),
        paddingBottom: wp('2%'),
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray'
    },
    classesBtn: {
        width: wp('75%'),
        height: wp('8%'),
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    classesText: {
        color: Colors.app_color,
        fontSize: wp('4.2%'),
        marginHorizontal: wp('2.5%')
    },
    noneBtn: {
        width: wp('100%'),
        height: wp('15%'),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.button_red
    },
})

export default GroupsScreen;

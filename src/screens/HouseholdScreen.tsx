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

const HouseholdScreen = (props: Props) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    const [selected, setSelected] = useState(null);
    const [memberList, setMemberList] = useState([{
        id: 1,
        name: 'James Smith',
        image: Images.ic_member,
        classes: [{
            time: '10:00am',
            selection: 'Nursery Nursery Nursery Nursery Nursery Nursery Nursery Nursery Nursery Nursery'
        },{
            time: '09:00am',
            selection: 'Homebuilders'
        },{
            time: '09:00am',
            selection: 'Homebuilders'
        },{
            time: '09:00am',
            selection: 'Homebuilders'
        },{
            time: '09:00am',
            selection: null
        },{
            time: '09:00am',
            selection: 'Homebuilders'
        }]
    }, {
        id: 2,
        name: 'Jack Smith',
        image: Images.ic_member,
        classes: [{
            time: '10:00am',
            selection: null
        },{
            time: '09:00am',
            selection: 'Worship'
        },{
            time: '08:00am',
            selection: null
        }]
    }, {
        id: 3,
        name: 'Tony Smith',
        image: Images.ic_member,
        classes: [{
            time: '10:00am',
            selection: 'Homebuilders'
        },{
            time: '09:00am',
            selection: 'Test'
        },{
            time: '08:00am',
            selection: 'Worship'
        }]
    }, {
        id: 4,
        name: 'Max Smith',
        image: Images.ic_member,
        classes: [{
            time: '10:00am',
            selection: null
        }]
    }]);

    useEffect(() => {

    }, [])

    const renderMemberItem = (item: any) => {
        return (
            <View>
                <TouchableOpacity style={styles.memberListView} onPress={() => { setSelected(selected != item.id ? item.id : null) }}>
                    <Icon name={selected == item.id ? 'angle-down' : 'angle-right'} style={styles.selectionIcon} size={wp('6%')} />
                    <Image source={item.image} style={styles.memberListIcon} />
                    <View style={styles.memberListTextView}>
                        <Text style={styles.memberListTitle} numberOfLines={1}>{item.name}</Text>
                        {selected != item.id && item.classes.map((item_class: any, index: any) => {
                            return(
                                <View>
                                    {item_class.selection ? 
                                        <Text style={styles.selectedText} numberOfLines={1}>
                                            {item_class.time}{" - "}{item_class.selection}
                                        </Text> 
                                    : null}
                                </View>
                            );
                        })}
                    </View>
                </TouchableOpacity>
                {selected == item.id && item.classes.map((item_class: any, index: any) => {
                    return (
                        <View style={{
                            ...styles.classesView, 
                            borderBottomWidth: ( index == item.classes.length - 1 ) ? 0 : 1
                        }}>
                            <View style={styles.classesTimeView}>
                                <Icon name={'clock-o'} style={styles.timeIcon} size={wp('5%')} />
                                <Text style={styles.classesTimeText}>{item_class.time}</Text>
                            </View>
                            <TouchableOpacity 
                                style={{
                                    ...styles.classesNoneBtn, 
                                    backgroundColor: item_class.selection ? Colors.button_green : Colors.button_bg
                                }}
                                onPress={() => item_class.selection ? null : navigate('GroupsScreen')}>
                                <Text style={styles.classesNoneText} numberOfLines={3}>
                                    {item_class.selection ? item_class.selection : 'NONE'}
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
                    data={memberList}
                    renderItem={({ item }) => renderMemberItem(item)}
                    keyExtractor={(item: any) => item.id}
                    style={styles.memberListStyle}
                />
                <TouchableOpacity style={styles.checkinBtn} onPress={() => navigate('HouseholdScreen')}>
                    <Text style={styles.checkinBtnText}>
                        CHECKIN
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
    memberListView: {
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
    memberListIcon: {
        width: wp('16%'),
        height: wp('16%'),
        marginHorizontal: wp('2%'),
        marginVertical: wp('2%'),
        borderRadius: wp('1.5%')
    },
    memberListTextView: {
        width: wp('62%'),
        marginVertical: wp('2%'),
        justifyContent: 'space-evenly',
    },
    memberListTitle: {
        fontSize: wp('4.2%'),
        fontFamily: Fonts.RobotoMedium,
        color: Colors.app_color,
        marginLeft: wp('2%'),
        width: wp('65%'),
    },
    memberListStyle: {
        marginVertical: wp('3%'),
    },
    selectionIcon: {
        fontSize: wp('6%'),
        color: 'gray',
        marginLeft: wp('3%')
    },
    timeIcon: {
        fontSize: wp('5%'),
        color: Colors.app_color,
        marginHorizontal: wp('1%')
    },
    classesView: {
        width: wp('90%'),
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: wp('2%'),
        paddingBottom: wp('2%'),
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray'
    },
    classesNoneBtn: {
        width: wp('55%'),
        height: wp('16%'),
        marginHorizontal: wp('2%'),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: wp('2%'),
    },
    classesTimeView: {
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
    },
    classesTimeText: {
        textAlign:'center',
        fontSize: wp('3.7%'),
        color: Colors.app_color,
    },
    selectedText: {
        width: wp('62%'),
        textAlign:'left',
        fontSize: wp('3.4%'),
        color: Colors.button_green,
        marginLeft: wp('2%'),
        marginVertical: wp('0.5%'),
    },
    classesNoneText: {
        width: wp('50%'),
        color: 'white',
        fontSize: wp('3.5%'),
        textAlign: 'center'
    },
    checkinBtnText: {
        color: 'white',
        fontSize: wp('4.2%'),
        textAlign: 'center',
        fontFamily: Fonts.RobotoMedium,
    },
    checkinBtn: {
        width: wp('100%'),
        height: wp('15%'),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.button_bg
    },
})

export default HouseholdScreen;

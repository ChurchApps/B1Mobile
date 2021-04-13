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
        classes: ['10:00am', '09:00am', '08:00am']
    }, {
        id: 2,
        name: 'Jack Smith',
        image: Images.ic_member,
        classes: ['10:00am', '09:00am', '08:00am']
    }, {
        id: 3,
        name: 'John Smith',
        image: Images.ic_member,
        classes: ['10:00am', '09:00am', '08:00am']
    }]);

    useEffect(() => {

    }, [])

    const renderMemberItem = (item: any) => {
        return (
            <View>
                <TouchableOpacity style={styles.memberListView} onPress={() => { setSelected(item.id) }}>
                    <Icon name={selected == item.id ? 'angle-down' : 'angle-right'} style={styles.selectionIcon} size={wp('6%')} />
                    <Image source={item.image} style={styles.memberListIcon} />
                    <View style={styles.memberListTextView}>
                        <Text style={styles.memberListTitle} numberOfLines={1}>{item.name}</Text>
                    </View>
                </TouchableOpacity>
                {selected == item.id && item.classes.map((itemC: any, index: any) => {
                    return (
                        <View style={{
                            ...styles.classesView, 
                            borderBottomWidth: ( index == item.classes.length - 1 ) ? 0 : 1
                        }}>
                            <Text style={styles.classesTimeText}>{itemC}</Text>
                            <TouchableOpacity style={styles.classesNoneBtn}>
                                <Text style={styles.classesNoneText}>NONE</Text>
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
                <Image source={Images.logoChums} style={styles.mainIcon} />
            </View>
            <SafeAreaView style={{ flex: 1 }}>
                <FlatList
                    data={memberList}
                    renderItem={({ item }) => renderMemberItem(item)}
                    keyExtractor={(item: any) => item.id}
                    style={styles.memberListStyle}
                />
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
        width: wp('70%'),
        height: wp('55%'),
        marginTop: wp('8%'),
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
        height: wp('12%'),
        justifyContent: 'space-evenly'
    },
    memberListTitle: {
        fontSize: wp('4.2%'),
        fontFamily: Fonts.RobotoMedium,
        color: Colors.app_color,
        marginLeft: wp('3%'),
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
    classesView: {
        width: wp('85%'),
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
        width: wp('35%'),
        height: wp('13%'),
        marginHorizontal: wp('2%'),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: wp('2%'),
        backgroundColor: Colors.button_bg
    },
    classesTimeText: {
        width: wp('40%'),
        textAlign:'center',
        fontSize: wp('3.8%')
    },
    classesNoneText: {
        color: 'white',
        fontSize: wp('3.5%')
    }
})

export default HouseholdScreen;

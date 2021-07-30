import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Image, Text, TextInput } from 'react-native';
import { TouchableOpacity, ScrollView, FlatList } from 'react-native-gesture-handler';
import Images from '../utils/Images';
import MainHeader from '../components/MainHeader';
import Loader from '../components/Loader';
import globalStyles from '../helper/GlobalStyles';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from '../utils/Colors';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ModalDatePicker } from "react-native-material-date-picker";
import moment from 'moment';
import FundDropDown from '../components/FundDropDown';
import Dialog, {
    DialogContent,
    ScaleAnimation,
} from 'react-native-popup-dialog';
import Fonts from '../utils/Fonts';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
        goBack: () => void;
        openDrawer: () => void;
    };
}

const DonationScreen = (props: Props) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    const [isLoading, setLoading] = useState(false);
    const [selectedMethod, setMethod] = useState(0);
    const [previewModal, setPreviewModal] = useState(false);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('Visa ****4242');
    const [date, setDate] = useState('Select a date');
    const [previewDate, setPreviewDate] = useState('');
    const [interval, setInterval] = useState('2');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([
        { label: 'Visa ****4242', value: 'Visa ****4242' },
        { label: 'Visa ****4243', value: 'Visa ****4243' },
        { label: 'Visa ****4244', value: 'Visa ****4244' },
        { label: 'Visa ****4245', value: 'Visa ****4245' }
    ]);
    const [fundList, setFundList] = useState([{
        id: 1,
        amount: 0,
        openDrop: false,
        fundType: {
            label: 'General Fund', value: 'General'
        }
    }]);
    const [intervalList, setIntervalList] = useState([{
        id: 1,
        openDrop: false,
        fundType: {
            label: 'Month(s)', value: 'Months'
        }
    }]);

    useEffect(() => {
    }, [])

    const AddMoreFundComponent = () => {
        const tempFundList = [...fundList];
        tempFundList.push({
            id: tempFundList.length + 1,
            amount: 0,
            openDrop: false,
            fundType: { label: '', value: '' }
        })
        setFundList(tempFundList);
    }

    const setFundAmountValues = (id: number, open: any, text: string) => {
        const tempFundList = [...fundList];
        tempFundList.map((item: any, index: any) => {
            if (item.id == id) {
                if (open != null && text == '') {
                    tempFundList[index] = {
                        ...item,
                        openDrop: open
                    }
                } else {
                    tempFundList[index] = {
                        ...item,
                        amount: text
                    }
                }
            }
        })
        setFundList(tempFundList);
    }

    const getTotalFunds = () => {
        var total: number = 0;
        fundList.map((item: any) => {
            total = total + Number(item.amount);
        })
        return total;
    }

    const handleConfirm = (date: any) => {
        const NewDate = moment(date).format("MM/DD/YYYY");
        const formatedDate = moment(date).format("MMM DD, YYYY");
        setPreviewDate(formatedDate);
        setDate(NewDate)
    };

    const previewView = (title: string, detail: any) => {
        let detailText = ''
        if (title == 'Funds') {
            detailText = '$' + detail[0].amount + ' - ' + detail[0].fundType.label
        } else if (title == 'Total') {
            detailText = '$' + detail
        } else {
            detailText = detail
        }
        return (
            <View style={globalStyles.previewView}>
                <Text style={globalStyles.previewTitleText}>{title} :</Text>
                <Text style={{ ...globalStyles.previewDetailText, fontSize: title == 'Total' ? wp('5.7%') : wp('4.2%') }}>{detailText}</Text>
            </View>
        );
    }

    const MethodButton = (title: string, method: number) => {
        return (
            <TouchableOpacity style={{ ...globalStyles.methodButton, backgroundColor: selectedMethod == method ? Colors.app_color : 'white' }} onPress={() => setMethod(method)}>
                <Text style={{ ...globalStyles.methodBtnText, color: selectedMethod == method ? 'white' : Colors.app_color }}>
                    {title}
                </Text>
            </TouchableOpacity>
        );
    }

    const DropDown = () => {
        return (
            <DropDownPicker
                listMode="SCROLLVIEW"
                open={open}
                items={items}
                value={value}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                containerStyle={globalStyles.containerStyle}
                style={globalStyles.dropDownMainStyle}
                labelStyle={globalStyles.labelStyle}
                listItemContainerStyle={globalStyles.itemStyle}
                dropDownContainerStyle={globalStyles.dropDownStyle}
                scrollViewProps={{ scrollEnabled: true }}
            />
        );
    }

    const FundComponent = (item: any) => {
        return (
            <View style={globalStyles.fundView} key={item.id}>
                <View>
                    <Text style={globalStyles.semiTitleText}>Amount</Text>
                    <TextInput style={globalStyles.fundInput} keyboardType='number-pad' value={item.amount.toString()} onChangeText={(text: any) => setFundAmountValues(item.id, null, text)} />
                </View>
                <View>
                    <Text style={globalStyles.semiTitleText}>Fund</Text>
                    <View>
                        <FundDropDown fundList={intervalList} setFundList={setIntervalList} type={'funds'} />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={globalStyles.homeContainer}>
            {/* Header */}
            <MainHeader
                leftComponent={<TouchableOpacity onPress={() => openDrawer()}>
                    <Image source={Images.ic_menu} style={globalStyles.menuIcon} />
                </TouchableOpacity>}
                mainComponent={<Text style={globalStyles.headerText}>Donate</Text>}
                rightComponent={null}
            />

            {/* Content */}
            <ScrollView nestedScrollEnabled={true}>
                <View style={globalStyles.methodContainer}>
                    {MethodButton('Make a Donation', 0)}
                    {MethodButton('Make a Recurring Donation', 1)}
                </View>
                <View>
                    <Text style={globalStyles.searchMainText}>Payment Method</Text>
                    {DropDown()}

                    {/* Donation Date View */}
                    <Text style={globalStyles.searchMainText}>Donation Date</Text>
                    <View style={globalStyles.dateInput}>
                        <Text style={globalStyles.dateText} numberOfLines={1}>{date.toString()}</Text>
                        <ModalDatePicker
                            button={<Icon name={'calendar-o'} style={globalStyles.selectionIcon} size={wp('6%')} />}
                            locale="en"
                            onSelect={(date) => handleConfirm(date)}
                            isHideOnSelect={true}
                            initialDate={new Date()}
                        />
                    </View>

                    {/* Interval View */}
                    {selectedMethod == 1 &&
                        <View style={globalStyles.fundView} >
                            <View>
                                <Text style={globalStyles.semiTitleText}>Interval Number</Text>
                                <TextInput style={globalStyles.fundInput} keyboardType='number-pad' value={interval} onChangeText={(text: any) => setInterval(text)} />
                            </View>
                            <View>
                                <Text style={globalStyles.semiTitleText}>Interval Type</Text>
                                <View>
                                    <FundDropDown fundList={intervalList} setFundList={setIntervalList} type={'interval'} />
                                </View>
                            </View>
                        </View>}

                    {/* Fund View */}
                    <Text style={globalStyles.semiTitleText}>Fund</Text>
                    <FlatList data={fundList} renderItem={({ item }) => FundComponent(item)} keyExtractor={(item: any) => item.id} />
                    <TouchableOpacity onPress={() => AddMoreFundComponent()}>
                        <Text style={globalStyles.addMoreText}>Add more</Text>
                    </TouchableOpacity>
                    <Text style={globalStyles.semiTitleText}>Total Donation Amount: ${getTotalFunds()}</Text>

                    {/* Notes View */}
                    <Text style={globalStyles.semiTitleText}>Notes</Text>
                    <TextInput style={globalStyles.notesInputView} keyboardType='default' value={notes} onChangeText={(text: any) => setNotes(text)} multiline={true} />

                    <View style={globalStyles.previewBtnView}>
                        <TouchableOpacity style={{ ...globalStyles.previewBtn, backgroundColor: Colors.button_yellow }}>
                            <Text style={globalStyles.previewBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ ...globalStyles.previewBtn, backgroundColor: Colors.button_dark_green }} onPress={() => setPreviewModal(true)}>
                            <Text style={globalStyles.previewBtnText}>Preview Donation</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            {isLoading && <Loader loading={isLoading} />}

            {/* Preview Popup */}
            <Dialog onTouchOutside={() => setPreviewModal(false)} width={0.86} visible={previewModal} dialogAnimation={new ScaleAnimation()}>
                <DialogContent>
                    <View style={globalStyles.donationPreviewView}>
                        <Text style={globalStyles.donationText}>Donation Preview</Text>
                        <TouchableOpacity onPress={() => { setPreviewModal(false) }} style={globalStyles.donationCloseBtn}>
                            <Icon name={'close'} style={globalStyles.closeIcon} size={wp('6%')} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        {previewView('Name', 'Mary Jackson')}
                        {previewView('Payment Method', value)}
                        {previewView('Type', selectedMethod == 0 ? 'One-time Donation' : 'Recurring Donation')}
                        {selectedMethod == 0 ? previewView('Donation Date', previewDate) : previewView('Starting On', previewDate)}
                        {selectedMethod == 1 && previewView('Recurring Every', interval + ' ' + intervalList[0].fundType.label)}
                        {previewView('Notes', notes)}
                        {previewView('Funds', fundList)}
                        {previewView('Total', getTotalFunds())}
                    </ScrollView>
                    <View style={globalStyles.popupBottomContainer}>
                        <TouchableOpacity style={{ ...globalStyles.popupButton, backgroundColor: '#6C757D' }}>
                            <Text style={globalStyles.popupButonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ ...globalStyles.popupButton, backgroundColor: Colors.button_bg }} onPress={() => setPreviewModal(true)}>
                            <Text style={globalStyles.popupButonText}>Donate</Text>
                        </TouchableOpacity>
                    </View>
                </DialogContent>
            </Dialog>
        </SafeAreaView>
    );
};

export default DonationScreen;
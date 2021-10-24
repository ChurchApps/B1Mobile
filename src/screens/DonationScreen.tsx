import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Image, Text, TextInput, TouchableOpacity } from 'react-native';
import { ScrollView, FlatList } from 'react-native-gesture-handler';
import Images from '../utils/Images';
import { globalStyles, Userhelper, ApiHelper } from '../helper';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from '../utils/Colors';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { ModalDatePicker } from "react-native-material-date-picker";
import moment from 'moment';
import { FundDropDown, Loader, MainHeader, PaymentMethods } from '../components';
import Dialog, { DialogContent, ScaleAnimation } from 'react-native-popup-dialog';
import Fonts from '../utils/Fonts';
import { CardField } from '@stripe/stripe-react-native';
import { initStripe } from "@stripe/stripe-react-native"
import { StripePaymentMethod } from '../interfaces';

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
    const [selectedMethod, setMethod] = useState<any>(null);
    const [previewModal, setPreviewModal] = useState(false);
    const [openPaymentDropdown, setPaymentDropdown] = useState(false);
    const [paymentDropdownValue, setPayDropValue] = useState('Visa ****4242');
    const [date, setDate] = useState('Select a date');
    const [previewDate, setPreviewDate] = useState('');
    const [interval, setInterval] = useState('2');
    const [notes, setNotes] = useState('');
    const [tempCardDetails, setTempCardDetails] = useState<any>('');
    const [cardList, setCardList] = useState<any>([]);
    const [methodValue, setMethodValue] = useState<any>(null);
    const [methodList, setMethodList] = useState(['Add Card', 'Add Bank']);
    const [acHolderName, setAcHolderName] = useState('');
    const [acHolderNumber, setAcHolderNumber] = useState('');
    const [routingNumber, setRoutingNumber] = useState('');
    const [selectMethodModal, setMethodModal] = useState(false);
    const [paymentDropItems, setPaymentDropItems] = useState([
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
    const [acHolderType, setAcHolderType] = useState([{
        id: 1,
        openDrop: false,
        fundType: {
            label: 'Individual', value: 'Individual'
        }
    }]);
    const [customerId, setCustomerId] = useState<string>("")
    const [paymentMethods, setPaymentMethods] = useState<StripePaymentMethod[]>()
    const person = Userhelper.person

    // initialise stripe
    useEffect(() => {
      (async () => {
        const data = await ApiHelper.get("/gateways", "GivingApi")
        if (data.length && data[0]?.publicKey) {
          initStripe({
            publishableKey: data[0].publicKey
          })
          const results = await ApiHelper.get("/paymentmethods/personId" + person.id, "GivingApi")
          if (!results.length) {
            setPaymentMethods([])
          }
          else {
            let cards = results[0].cards.data.map((card: any) => new StripePaymentMethod(card));
            let banks = results[0].banks.data.map((bank: any) => new StripePaymentMethod(bank));
            let methods = cards.concat(banks);
            setCustomerId(results[0].customer.id);
            setPaymentMethods(methods);
          }
        } else {
          setPaymentMethods([])
        }
      })()
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
                open={openPaymentDropdown}
                items={paymentDropItems}
                value={paymentDropdownValue}
                setOpen={setPaymentDropdown}
                setValue={setPayDropValue}
                setItems={setPaymentDropItems}
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

    const BottomButtonView = (first: string, second: string) => {
        return (
            <View style={globalStyles.previewBtnView}>
                <TouchableOpacity style={{ ...globalStyles.previewBtn, backgroundColor: Colors.button_yellow }}
                    onPress={() => {
                        if (second == 'Save') {
                            setMethodValue(null);
                        } else {
                            setMethod(null);
                        }
                    }}>
                    <Text style={globalStyles.previewBtnText}>{first}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ ...globalStyles.previewBtn, backgroundColor: Colors.button_dark_green }}
                    onPress={() => {
                        if (second == 'Save') {
                            if (methodValue == 0) {
                                //Add card tap
                                const card_list = [...cardList];
                                card_list.push(tempCardDetails);
                                setCardList(card_list);
                            } else {
                                //Add bank account tap
                            }
                            setMethodValue(null);
                        } else {
                            //Preview mode tap
                            setPreviewModal(true)
                        }
                    }}>
                    <Text style={globalStyles.previewBtnText}>{second}</Text>
                </TouchableOpacity>
            </View >
        );
    }

    const PaymentMethodView = () => {
        if (methodValue == null && cardList.length > 0) {
            return (
                <FlatList
                    data={cardList}
                    renderItem={({ item }) =>
                        <View style={globalStyles.cardListView} key={item.last4}>
                            <Text style={globalStyles.cardListText}> {item.brand + ' ****' + item.last4}</Text>
                            <TouchableOpacity onPress={() => { }}>
                                <FontAwesome5 name={'pencil-alt'} style={{ color: Colors.app_color }} size={wp('5.5%')} />
                            </TouchableOpacity>
                        </View>}
                    keyExtractor={(item: any) => item.last4}
                    ItemSeparatorComponent={({ item }) => <View style={globalStyles.cardListSeperator} />}
                />
            );
        } else {
            if (methodValue == 0) {
                return (<View>
                    <CardField
                        postalCodeEnabled={true}
                        placeholder={{ number: '4242 4242 4242 4242' }}
                        cardStyle={{ backgroundColor: '#FFFFFF', textColor: '#000000' }}
                        style={{ width: '100%', height: 50, marginTop: wp('2%'), backgroundColor: 'white' }}
                        onCardChange={(cardDetails) => {
                            setTempCardDetails(cardDetails)
                        }}
                        onFocus={(focusedField) => { console.log('focusField', focusedField) }}
                    />
                    {BottomButtonView('Cancel', 'Save')}
                </View>);
            } else if (methodValue == 1) {
                return (
                    <>
                        <View style={{ marginBottom: wp('5%') }}>
                            <Text style={globalStyles.semiTitleText}>Amount Holder Name</Text>
                            <TextInput style={{ ...globalStyles.fundInput, width: wp('90%') }} keyboardType='default' value={acHolderName} onChangeText={setAcHolderName} />
                            <Text style={globalStyles.semiTitleText}>Account Holder Type</Text>
                            <View style={{ width: wp('100%'), marginBottom: wp('12%') }}>
                                <FundDropDown fundList={acHolderType} setFundList={setAcHolderType} type={'holder'} />
                            </View>
                            <Text style={globalStyles.semiTitleText}>Amount Number</Text>
                            <TextInput style={{ ...globalStyles.fundInput, width: wp('90%') }} keyboardType='number-pad' value={acHolderNumber} onChangeText={setAcHolderNumber} />
                            <Text style={globalStyles.semiTitleText}>Routing Number</Text>
                            <TextInput style={{ ...globalStyles.fundInput, width: wp('90%') }} keyboardType='number-pad' value={routingNumber} onChangeText={setRoutingNumber} />
                        </View>
                        {BottomButtonView('Cancel', 'Save')}
                    </>
                );
            } else {
                return (<Text style={globalStyles.paymentDetailText}>No payment methods.</Text>);
            }
        }
    }

    const TitleComponent = (title: string) => {
        return (
            <View style={globalStyles.paymentTitleContainer}>
                <View style={{ width: wp('100%') }}>
                    <View style={globalStyles.paymentTitleHeaderLine} />
                    <View style={globalStyles.paymentTitleView}>
                        {title == 'Payment Methods' ?
                            <Icon name={'credit-card-alt'} style={{ color: 'gray' }} size={wp('5.5%')} /> :
                            <Image source={Images.ic_give} style={globalStyles.donationIcon} />}
                        <Text style={globalStyles.paymentTitleText}>{title}</Text>
                        {title == 'Payment Methods' ?
                            <TouchableOpacity onPress={() => setMethodModal(true)}>
                                <Icon name={'plus'} style={{ color: Colors.button_green }} size={wp('6%')} />
                            </TouchableOpacity>
                            : <View style={{ width: wp('6%') }} />}
                    </View>
                </View>
                {
                    title == 'Payment Methods' ?
                        PaymentMethodView() :
                        title == 'Donate' ? DonationView() :
                            <Text style={globalStyles.paymentDetailText}>Donations will appear once a donation has been entered.</Text>
                }
            </View >
        );
    }

    const DonationView = () => {
        return (
            <>
                <ScrollView nestedScrollEnabled={true}>
                    <View style={globalStyles.methodContainer}>
                        {MethodButton('Make a Donation', 0)}
                        {MethodButton('Make a Recurring Donation', 1)}
                    </View>

                    {selectedMethod != null ?
                        <>
                            <View>
                                <Text style={{ ...globalStyles.searchMainText, marginTop: wp('4%') }}>Payment Method</Text>
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
                                    <View style={{ ...globalStyles.fundView, flexDirection: 'column' }} >
                                        <Text style={globalStyles.semiTitleText}>Interval Type</Text>
                                        <View style={{ width: wp('100%'), marginBottom: wp('15%') }}>
                                            <FundDropDown fundList={intervalList} setFundList={setIntervalList} type={'interval'} />
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
                                {/* <Text style={globalStyles.semiTitleText}>Notes</Text>
                                <TextInput style={globalStyles.notesInputView} keyboardType='default' value={notes} onChangeText={(text: any) => setNotes(text)} multiline={true} /> */}

                            </View>
                            {BottomButtonView('Cancel', 'Preview Donation')}
                        </>
                        : null}
                </ScrollView>
            </>
        );
    }

    return (
        <SafeAreaView style={globalStyles.grayContainer}>
            {/* Header */}
            <MainHeader
                leftComponent={<TouchableOpacity onPress={() => openDrawer()}>
                    <Image source={Images.ic_menu} style={globalStyles.menuIcon} />
                </TouchableOpacity>}
                mainComponent={<Text style={globalStyles.headerText}>Donate</Text>}
                rightComponent={null}
            />

            {/* Content */}
            <ScrollView>
              <PaymentMethods customerId={customerId} />
                {TitleComponent('Payment Methods')}
                {TitleComponent('Donate')}
                {TitleComponent('Donations')}
            </ScrollView>
            {isLoading && <Loader isLoading={isLoading} />}

            {/* Select Method Popup */}
            <Dialog onTouchOutside={() => setMethodModal(false)} width={0.5} visible={selectMethodModal} dialogAnimation={new ScaleAnimation()}>
                <DialogContent>
                    <FlatList
                        data={methodList}
                        style={{ marginTop: wp('1%'), marginBottom: wp('-5%') }}
                        renderItem={({ item, index }) =>
                            <TouchableOpacity onPress={() => { setMethodValue(index); setMethodModal(false) }} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name={index == 0 ? 'credit-card-alt' : 'bank'} style={{ color: Colors.button_green, marginHorizontal: wp('4%') }} size={wp('6%')} />
                                <Text style={{ fontSize: wp('4.8%'), fontFamily: Fonts.RobotoRegular, textAlign: 'center', paddingVertical: wp('2%') }}>{item}</Text>
                            </TouchableOpacity>}
                        keyExtractor={(item: any) => item}
                        ItemSeparatorComponent={({ item }) => <View style={globalStyles.cardListSeperator} />}
                    />
                </DialogContent>
            </Dialog>

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
                        {previewView('Payment Method', paymentDropdownValue)}
                        {previewView('Type', selectedMethod == 0 ? 'One-time Donation' : 'Recurring Donation')}
                        {selectedMethod == 0 ? previewView('Donation Date', previewDate) : previewView('Starting On', previewDate)}
                        {selectedMethod == 1 && previewView('Recurring Every', interval + ' ' + intervalList[0].fundType.label)}
                        {/* {previewView('Notes', notes)} */}
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
        </SafeAreaView >
    );
};

export default DonationScreen;
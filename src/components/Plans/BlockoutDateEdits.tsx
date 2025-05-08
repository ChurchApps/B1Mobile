import { ApiHelper, DimensionHelper } from '@churchapps/mobilehelper';
import moment from 'moment';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlockoutDateInterface, Constants, globalStyles } from '../../helpers';
import { CustomModal } from '../modals/CustomModal';

interface Props {
  blockoutDate: any;
  onClose: () => void;
  visible: boolean;
  onUpdate: () => void;
}

export const BlockoutDateEdits = ({ onClose, visible, blockoutDate, onUpdate }: Props) => {
  console.log("props from previous screen ----->", blockoutDate)
  const [BlockoutDate, setBlockoutDate] = useState<BlockoutDateInterface>(blockoutDate);
  const blockOutEndDate = BlockoutDate.endDate;
  const blockOutStartDate = BlockoutDate.startDate;
  const [errors, setErrors] = useState<string[]>([]);
  const [endDate, setEndDate] = useState(blockOutEndDate ? blockOutEndDate : new Date());
  const [startDate, setStartDate] = useState(blockOutStartDate ? blockOutStartDate : new Date());

  const validate = () => {
    const result: string[] = [];
    if (!BlockoutDate.startDate) result.push("Start date is required.");
    if (!BlockoutDate.endDate) result.push("End date is required.");
    if (BlockoutDate.startDate && BlockoutDate.endDate && BlockoutDate.startDate > BlockoutDate.endDate) result.push("Start date must be before end date.");
    setErrors(result);
    return result.length === 0;
  }

  console.log("error data is----->", errors)
  const onPressSaveButton = () => {
    console.log("block out date is ----->", BlockoutDate)
    if (validate()) {
      ApiHelper.post("/blockoutDates", [BlockoutDate], "DoingApi").then(() => {
        onClose();
        onUpdate();
      });
    } else {
      return;
    }
  }
  const onPressDeleteButton = (id: number) => {
    ApiHelper.delete("/blockoutDates/" + id, "DoingApi").then(() => {
      onClose();
      onUpdate();
    });
  }

  return (
    <>
      <CustomModal width={DimensionHelper.wp(90)} isVisible={visible} close={() => onClose()}>
        <View style={{ paddingHorizontal: DimensionHelper.wp(1) }}>
          <View style={[globalStyles.donationPreviewView, { borderBottomWidth: 0 }]}>
            <View style={globalStyles.PlanIconTitleView}>
              <Icons name='block-helper' style={{ color: Constants.Colors.app_color }} size={DimensionHelper.wp('5.5%')} />
              <Text style={globalStyles.PlanTitleTextStyle}>Blockout Dates</Text>
            </View>
          </View>

          <View style={globalStyles.InputBtnView}>
            <View style={globalStyles.InputView}>
              <Text style={globalStyles.PassInputTextStyle}>{moment(startDate).format('DD-MM-YYYY')}</Text>
            </View>
            <DatePicker
              date={typeof startDate === 'string' ? new Date(startDate) : startDate}
              onDateChange={(date) => {
                const selectedDate = new Date(date);
                selectedDate.setHours(23, 59, 59, 999);
                setBlockoutDate({ ...BlockoutDate, startDate: selectedDate })
                setStartDate(date)
                setErrors([]);
              }}
              mode="date"
            />
          </View>
          <View style={globalStyles.InputBtnView}>
            <View style={globalStyles.InputView}>
              <Text style={globalStyles.PassInputTextStyle}>{moment(endDate).format('DD-MM-YYYY')}</Text>
            </View>
            <DatePicker
              date={typeof endDate === 'string' ? new Date(endDate) : endDate}
              onDateChange={(date) => {
                const selectedDate = new Date(date);
                selectedDate.setHours(23, 59, 59, 999);
                setBlockoutDate({ ...BlockoutDate, endDate: selectedDate })
                setEndDate(date)
                setErrors([]);
              }}
              mode="date"
            />
          </View>
          <View style={globalStyles.CancelAddbuttonView}>
            <TouchableOpacity onPress={() => { onClose() }}>
              <Text style={[globalStyles.ButtonTextStyle, { color: Constants.Colors.button_red }]}>CANCEL</Text>
            </TouchableOpacity>
            {Object.keys(blockoutDate).length > 0 ?
              <TouchableOpacity onPress={() => onPressDeleteButton(blockoutDate.id)} style={globalStyles.DeleteButtonStyle}>
                <Text style={[globalStyles.ButtonTextStyle, { color: Constants.Colors.button_red }]}>DELETE</Text>
              </TouchableOpacity>
              : null
            }
            <TouchableOpacity onPress={() => onPressSaveButton()} style={globalStyles.SaveButtonStyle}>
              <Text style={[globalStyles.ButtonTextStyle, { color: Constants.Colors.white_color }]}>SAVE</Text>
            </TouchableOpacity>
          </View>
          {errors.length > 0 && (
            <View>
              {errors.map((error, index) => (
                <Text key={index} style={{ color: Constants.Colors.button_red }}>
                  {error}
                </Text>
              ))}
            </View>)}
        </View>
      </CustomModal>
    </>
  )
}
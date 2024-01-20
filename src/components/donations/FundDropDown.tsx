import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { globalStyles } from '../../helpers';

export function FundDropDown(props: any) {
  const [openFundDropDown, setOpenFundDropDown] = useState(false);
  const [valueType, setValueType] = useState(null);
  const [itemsType, setItemsType] = useState([
    { label: 'General Fund', value: 'General' },
    { label: 'Van Fund', value: 'Van' },
    { label: 'Van Fund2', value: 'Van2' },
  ]);
  const [intervalType, setIntervalType] = useState([
    { label: 'Month(s)', value: 'Months' },
    { label: 'Week(s)', value: 'Weeks' }
  ]);
  const [acHolderType, setAcHolderType] = useState([
    { label: 'Individual', value: 'Individual' }
  ]);

  const setFundTypeValues = (id: number, type: any) => {
    const tempFundList = [...props.fundList];
    tempFundList.map((item: any, index: any) => {
      if (item.id == id) {
        itemsType.map((type_value) => {
          if (type == type_value.value) {
            tempFundList[index] = {
              ...item,
              fundType: type_value
            }
          }
        })
      }
    })
    props.setFundList(tempFundList);
  }

  const getHeight = () => {
    if (openFundDropDown) {
      return props.type == 'funds' ? props.type == 'interval' ? itemsType.length * DimensionHelper.wp('16%') : intervalType.length * DimensionHelper.wp('16%') : acHolderType.length * DimensionHelper.wp('16%')
    } else {
      return 0
    }
  }

  return (
    <DropDownPicker
      listMode="SCROLLVIEW"
      items={props.type == 'funds' ? props.type == 'interval' ? itemsType : intervalType : acHolderType}
      open={openFundDropDown}
      setOpen={setOpenFundDropDown}
      value={valueType}
      setValue={setValueType}
      onChangeValue={(value) => setFundTypeValues}
      containerStyle={{ ...globalStyles.containerStyle, width: props.type == 'funds' ? DimensionHelper.wp('40%') : DimensionHelper.wp('90%'), height: getHeight() }}
      style={{ ...globalStyles.dropDownMainStyle, height: DimensionHelper.wp('12%') }}
      labelStyle={globalStyles.labelStyle}
      listItemContainerStyle={globalStyles.itemStyle}
      dropDownContainerStyle={{ ...globalStyles.dropDownStyle, width: props.type == 'funds' ? DimensionHelper.wp('40%') : DimensionHelper.wp('90%') }}
      scrollViewProps={{ nestedScrollEnabled: true }}
    />
  );
};

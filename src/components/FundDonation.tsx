import React, { useState, useEffect } from "react";
import { Text, View, TextInput } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { globalStyles } from "../helper";
import { FundDonationInterface, FundInterface } from "../interfaces";

interface Props {
  fundDonation: FundDonationInterface;
  funds: FundInterface[];
  index: number;
  updatedFunction: (fundDonation: FundDonationInterface, index: number) => void;
}

export function FundDonation({ fundDonation, funds, index, updatedFunction }: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [fundList, setFundList] = useState<{ label: string; value: string }[]>(
    funds.map((f) => ({ label: f.name, value: f.id }))
  );
  const [selectedFund, setSelectedFund] = useState<string>(fundList[0].value);

  const handleAmountChange = (text: string) => {
    let fd = { ...fundDonation }
    fd.amount = parseFloat(text.replace("$", "").replace(",", ""))
    updatedFunction(fd, index)
  };

  useEffect(() => {
    let fd = { ...fundDonation }
    fd.fundId = selectedFund
    updatedFunction(fd, index)
  }, [selectedFund])

  return (
    <View style={globalStyles.fundView} key={index}>
      <View>
        <Text style={globalStyles.semiTitleText}>Amount</Text>
        <TextInput style={globalStyles.fundInput} keyboardType="number-pad" onChangeText={handleAmountChange} />
      </View>
      <View>
        <Text style={globalStyles.semiTitleText}>Fund</Text>
        <View>
          <DropDownPicker
            listMode="SCROLLVIEW"
            open={isDropdownOpen}
            items={fundList}
            value={selectedFund}
            setOpen={setIsDropdownOpen}
            setValue={setSelectedFund}
            setItems={setFundList}
            containerStyle={{
              ...globalStyles.containerStyle,
              height: isDropdownOpen ? fundList.length * wp("18%") : 0,
              width: wp("45%"),
            }}
            style={globalStyles.dropDownMainStyle}
            labelStyle={globalStyles.labelStyle}
            listItemContainerStyle={globalStyles.itemStyle}
            dropDownContainerStyle={{ ...globalStyles.dropDownStyle, width: wp("45%") }}
            scrollViewProps={{ scrollEnabled: true }}
            dropDownDirection="BOTTOM"
          />
        </View>
      </View>
    </View>
  );
}

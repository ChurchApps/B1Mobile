import React, { useState } from "react";
import { Image, ScrollView, View, TouchableOpacity, Text } from "react-native";
import { InputBox } from ".";
import Images from "../utils/Images";
import Colors from "../utils/Colors";
import { globalStyles } from "../helper";

export function DonationForm() {
  const [donationType, setDonationType] = useState<string>("");

  const handleSave = () => {};

  const handleCancel = () => { 
    setDonationType("")
  };

  return (
    <InputBox
      title="Donate"
      headerIcon={<Image source={Images.ic_give} style={globalStyles.donationIcon} />}
      saveFunction={donationType ? handleSave : undefined}
      cancelFunction={donationType ? handleCancel : undefined}
    >
      <ScrollView nestedScrollEnabled={true}>
        <View style={globalStyles.methodContainer}>
          <TouchableOpacity
            style={{
              ...globalStyles.methodButton,
              backgroundColor: donationType === "once" ? Colors.app_color : "white",
            }}
            onPress={() => setDonationType("once")}
          >
            <Text
              style={{ ...globalStyles.methodBtnText, color: donationType === "once" ? "white" : Colors.app_color }}
            >
              Make a Donation
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              ...globalStyles.methodButton,
              backgroundColor: donationType === "recurring" ? Colors.app_color : "white",
            }}
            onPress={() => setDonationType("recurring")}
          >
            <Text
              style={{
                ...globalStyles.methodBtnText,
                color: donationType === "recurring" ? "white" : Colors.app_color,
              }}
            >
              Make a Recurring Donation
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </InputBox>
  );
}

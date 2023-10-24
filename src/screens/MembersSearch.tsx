import React, { useState, useEffect, useMemo } from "react";
import { View, SafeAreaView, Image, Text, Alert, TextInput, StyleSheet, Dimensions, PixelRatio } from "react-native";
import { FlatList, ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as lor, removeOrientationListener as rol } from "react-native-responsive-screen";
import {  Constants, EnvironmentHelper, UserHelper, Utilities } from "../helpers";
import { ApiHelper } from "@churchapps/mobilehelper";
import { globalStyles } from "../helpers";
import { BlueHeader, Loader, SimpleHeader, WhiteHeader } from "../components";

interface Props {
  navigation: {
    navigate: (screenName: string, params: any) => void;
    goBack: () => void;
    openDrawer: () => void;
  };
}

export const MembersSearch = (props: Props) => {
  const { navigate, goBack, openDrawer } = props.navigation;
  const [searchText, setSearchText] = useState("");
  const [searchList, setSearchList] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [dimension, setDimension] = useState(Dimensions.get("screen"));

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
  };

  useEffect(() => {
    Utilities.trackEvent("Member Search Screen");
    loadMembers()
    UserHelper.addOpenScreenEvent("MembersSearch");
    Dimensions.addEventListener("change", () => {
      const dim = Dimensions.get("screen")
      setDimension(dim);
    })
  }, [])

  useEffect(()=>{
  },[dimension])



  const loadMembers = () => {
    ApiHelper.get("/people", "MembershipApi").then(data => {
      setLoading(false);
      setSearchList(data);
      setMembersList(data);
      if (data.length === 0) Alert.alert("Alert", "No matches found");
    })
  }

  const filterMember = (searchText: string) => {
    let filterList = membersList.filter((item: any) => {
      if (item.name.display.toLowerCase().match(searchText.toLowerCase())) { return item }
    })
    if (searchText != "") {
      setSearchList(filterList)
    } else {
      setSearchList(membersList)
    }
  }

  const renderMemberItem = (item: any) => {
    return (
      <TouchableOpacity style={[globalStyles.listMainView, { width: wd("90%") }]} onPress={() => { navigate("MemberDetailScreen", { member: item }) }}>
        <Image source={item.photo ? { uri: EnvironmentHelper.ContentRoot + item.photo } : Constants.Images.ic_member} style={globalStyles.memberListIcon} />
        <View style={globalStyles.listTextView}>
          <Text style={globalStyles.listTitleText}>{item.name.display}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const getResults = () => {
    if (isLoading) return <></>
    else if (searchList.length == 0) return <Text style={globalStyles.recentText}>No results found</Text>
    else return <FlatList data={searchList} renderItem={({ item }) => renderMemberItem(item)} keyExtractor={(item: any) => item.id} style={globalStyles.churchListStyle}/>
  }

  return (
    <SafeAreaView style={[globalStyles.grayContainer,{alignSelf:"center"}]}>
      <View style={{ width: dimension.width, flex: 1, alignItems: "center", justifyContent: "center" }}>
        <SimpleHeader onPress={() => openDrawer()} title="Directory" />
        <ScrollView style={globalStyles.grayContainer} >
          <Text style={[globalStyles.searchMainText, { marginHorizontal: wd("5%") }]}>Find Members</Text>
          <View style={[globalStyles.textInputView, { width: wd("90%") }]}>
            <Image source={Constants.Images.ic_search} style={globalStyles.searchIcon} />
            <TextInput style={[globalStyles.textInputStyle, { width: wd("90%") }]} placeholder={"Member Name"} autoCapitalize="none" autoCorrect={false} keyboardType="default" placeholderTextColor={"lightgray"} value={searchText} onChangeText={(text) => { setSearchText(text) }} />

          </View>
          <TouchableOpacity style={[globalStyles.roundBlueButton, { marginTop: wp("6%"), width: wd("90%") }]} onPress={() => filterMember(searchText)}>
            <Text style={globalStyles.roundBlueButtonText}>SEARCH</Text>
          </TouchableOpacity>
       
            {getResults()}
        </ScrollView>
        {isLoading && <Loader isLoading={isLoading} />}
      </View>
    </SafeAreaView>
  );
};

